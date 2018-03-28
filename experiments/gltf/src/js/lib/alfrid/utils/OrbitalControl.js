// OrbitalControl.js
'use strict';

import EaseNumber from './EaseNumber';
import Scheduler from  'scheduling';
import { vec3 } from 'gl-matrix';

const getMouse = function (mEvent, mTarget) {

	const o = mTarget || {};
	if(mEvent.touches) {
		o.x = mEvent.touches[0].pageX;
		o.y = mEvent.touches[0].pageY;
	} else {
		o.x = mEvent.clientX;
		o.y = mEvent.clientY;
	}

	return o;
};

class OrbitalControl {

	constructor(mTarget, mListenerTarget = window, mRadius = 500) {
		this._target         = mTarget;
		this._listenerTarget = mListenerTarget;
		this._mouse          = {};
		this._preMouse       = {};
		this.center          = vec3.create();
		this._up             = vec3.fromValues(0, 1, 0);
		this.radius          = new EaseNumber(mRadius);
		this.position        = vec3.fromValues(0, 0, this.radius.value);
		this.positionOffset  = vec3.create();
		this._rx             = new EaseNumber(0);
		this._rx.limit(-Math.PI / 2, Math.PI / 2);
		this._ry             = new EaseNumber(0);
		this._preRX          = 0;
		this._preRY          = 0;
		
		this._isLockZoom     = false;
		this._isLockRotation = false;
		this._isInvert       = false;
		this.sensitivity	 = 1.0;


		this._wheelBind = (e) => this._onWheel(e);
		this._downBind = (e) => this._onDown(e);
		this._moveBind = (e) => this._onMove(e);
		this._upBind = () => this._onUp();
	
		this.connect();		
		Scheduler.addEF(() => this._loop());
	}

	connect() {
		this.disconnect();

		this._listenerTarget.addEventListener('mousewheel', this._wheelBind);
		this._listenerTarget.addEventListener('DOMMouseScroll', this._wheelBind);

		this._listenerTarget.addEventListener('mousedown', this._downBind);
		this._listenerTarget.addEventListener('touchstart', this._downBind);
		this._listenerTarget.addEventListener('mousemove', this._moveBind);
		this._listenerTarget.addEventListener('touchmove', this._moveBind);
		window.addEventListener('touchend', this._upBind);
		window.addEventListener('mouseup', this._upBind);
	}

	disconnect() {
		this._listenerTarget.removeEventListener('mousewheel', this._wheelBind);
		this._listenerTarget.removeEventListener('DOMMouseScroll', this._wheelBind);

		this._listenerTarget.removeEventListener('mousedown', this._downBind);
		this._listenerTarget.removeEventListener('touchstart', this._downBind);
		this._listenerTarget.removeEventListener('mousemove', this._moveBind);
		this._listenerTarget.removeEventListener('touchmove', this._moveBind);
		window.removeEventListener('touchend', this._upBind);
		window.removeEventListener('mouseup', this._upBind);
	}


	//	PUBLIC METHODS

	lock(mValue = true) {
		this._isLockZoom = mValue;
		this._isLockRotation = mValue;
		this._isMouseDown = false;
	}

	lockZoom(mValue = true) {
		this._isLockZoom = mValue;
	}


	lockRotation(mValue = true) {
		this._isLockRotation = mValue;
	}


	inverseControl(isInvert = true) {
		this._isInvert = isInvert;
	}


	//	EVENT HANDLERES
	_onDown(mEvent) {
		if(this._isLockRotation) { return; }
		this._isMouseDown = true;
		getMouse(mEvent, this._mouse);
		getMouse(mEvent, this._preMouse);
		this._preRX = this._rx.targetValue;
		this._preRY = this._ry.targetValue;
	}


	_onMove(mEvent) {
		if(this._isLockRotation) { return; }
		getMouse(mEvent, this._mouse);
		if(mEvent.touches) { mEvent.preventDefault(); }

		if(this._isMouseDown) {
			let diffX = -(this._mouse.x - this._preMouse.x);
			if(this._isInvert) { diffX *= -1; }
			this._ry.value = this._preRY - diffX * 0.01 * this.sensitivity;

			let diffY = -(this._mouse.y - this._preMouse.y);
			if(this._isInvert) { diffY *= -1; }
			this._rx.value = this._preRX - diffY * 0.01 * this.sensitivity;
		}
	}


	_onUp() {
		if(this._isLockRotation) { return; }
		this._isMouseDown = false;
	}


	_onWheel(mEvent) {
		if(this._isLockZoom) {	return;	}
		const w = mEvent.wheelDelta;
		const d = mEvent.detail;
		let value = 0;
		if (d) {
			if (w) {
				value = w / d / 40 * d > 0 ? 1 : -1; // Opera
			} else {
				value = -d / 3;              // Firefox;         TODO: do not /3 for OS X
			}
		} else {
			value = w / 120; 
		}

		this.radius.add(-value * 2);
	}


	//	PRIVATE METHODS

	_loop() {

		this._updatePosition();

		if(this._target) {
			this._updateCamera();
		}
	}


	_updatePosition() {
		this.position[1] = Math.sin(this._rx.value) * this.radius.value;
		const tr = Math.cos(this._rx.value) * this.radius.value;
		this.position[0] = Math.cos(this._ry.value + Math.PI * 0.5) * tr;
		this.position[2] = Math.sin(this._ry.value + Math.PI * 0.5) * tr;
		vec3.add(this.position, this.position, this.positionOffset);
	}


	_updateCamera() {
		this._target.lookAt(this.position, this.center, this._up);
	}


	//	GETTER / SETTER


	get rx() {
		return this._rx;
	}


	get ry() {
		return this._ry;
	}
}


export default OrbitalControl;