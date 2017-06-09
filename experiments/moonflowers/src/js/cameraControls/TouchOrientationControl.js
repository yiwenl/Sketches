// TouchOrientationControl.js

import { EaseNumber } from 'alfrid';
import getCursorPos from '../utils/getCursorPos';
import { mat4, quat } from 'gl-matrix';

class TouchOrientationControl {
	constructor(mCamera, mTarget=window) {
		this._camera = mCamera;
		this._listenerTarget = mTarget;
		this._isDown = false;
		this._rotation = mat4.create();

		this.rx = new EaseNumber(0);
		this.ry = new EaseNumber(0);
		this._rx = 0;
		this._ry = 0;
		this._mouseDown = {
			x:0,
			y:0
		}

		this._mouse = {
			x:0,
			y:0
		}

		this.senstivity = 0.02;
		this._init();

		this._screenRotation = 0;

		this._isLocked = false;
	}	

	lock(mValue) {
		this._isLocked = mValue;
	}

	_init() {
		this._listenerTarget.addEventListener('mousedown', (e) => this._onDown(e));
		this._listenerTarget.addEventListener('mouseup', () => this._onUp());
		this._listenerTarget.addEventListener('mousemove', (e) => this._onMove(e));

		this._listenerTarget.addEventListener('touchstart', (e) => this._onDown(e));
		this._listenerTarget.addEventListener('touchend', () => this._onUp());
		this._listenerTarget.addEventListener('touchmove', (e) => this._onMove(e));
	}


	_onDown(e) {
		console.log('mouse down', this._isLocked);
		if(this._isLocked) { return; }
		this._isDown = true;

		this._mouseDown = getCursorPos(e);
		this._mouse = getCursorPos(e);

		this._rx = this.rx.value;
		this.rx.setTo(this._rx);
		this._ry = this.ry.value;
		this.ry.setTo(this._ry);
	}


	_onMove(e) {
		if(this._isLocked) { return; }
		if(!this._isDown)	{	return;	}

		this._mouse = getCursorPos(e);
	}


	_onUp() {
		if(this._isLocked) { return; }
		this._isDown = false;
	}


	update() {
		if(this._isLocked) { return; }
		let dx = this._mouse.x - this._mouseDown.x;
		let dy = this._mouse.y - this._mouseDown.y;
		this.ry.value = this._ry + dx * this.senstivity;
		this.rx.value = this._rx + dy * this.senstivity;

		const q = quat.create();
		quat.rotateX(q, q, this.rx.value);
		quat.rotateY(q, q, this.ry.value);

		mat4.fromQuat(this._camera.viewMatrix, q);
		mat4.fromQuat(this._rotation, q);
		// mat4.invert(this._camera._mtxInvertView, this._camera._mtxView);
	}

	get rotation() {	return this._rotation;	}

	get uiOrientation() {	return this._screenRotation;	}
}


export default TouchOrientationControl;