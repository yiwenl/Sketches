// TouchDetector.js

import { EventDispatcher, Scheduler } from 'alfrid';

const getMouse = (e) => {
	if(e.touches) {
		return {
			x:e.touches[0].pageX,
			y:e.touches[0].pageY
		}
	} else {
		return {
			x:e.clientX,
			y:e.clientY
		}
	}
}

class TouchDetector extends EventDispatcher {

	constructor(mListener=window) {
		super();

		this._listenerTarget = mListener;
		this._isMouseDown = false;
		this._mouse = {
			x:0, 
			y:0
		}

		this._press = {
			x:0, 
			y:0
		}

		this._downBind = (e) => this._onDown(e);
		this._upBind = () => this._onUp();
		this._moveBind = (e) => this._onMove(e);
		this._clickBind = (e) => this._onClick(e);

		this.connect();

		Scheduler.addEF(()=>this._update());
	}


	connect() {
		this._listenerTarget.addEventListener('mousedown', this._downBind);
		this._listenerTarget.addEventListener('mousemove', this._moveBind);
		this._listenerTarget.addEventListener('mouseup', this._upBind);
		this._listenerTarget.addEventListener('click', this._clickBind);
	}

	disconnect() {
		this._listenerTarget.removeEventListener('mousedown', this._downBind);
		this._listenerTarget.removeEventListener('mousemove', this._moveBind);
		this._listenerTarget.removeEventListener('mouseup', this._upBind);
	}


	_onClick(e) {
		this.trigger('onClick', getMouse(e));
	}


	_onDown(e) {
		this._isMouseDown = true;

		this._press = getMouse(e);
		this._mouse = getMouse(e);
		this._mouse.dx = 0;
		this._mouse.dy = 0;
	}


	_onMove(e) {
		this._mouse = getMouse(e);
		this._mouse.dx = (this._mouse.x - this._press.x) * 10;
		this._mouse.dy = (this._mouse.y - this._press.y) * 10;
		this._press = getMouse(e);
	}

	_update() {
		if(this._isMouseDown) {
			this.trigger('onDrag', this._mouse);
		} else {
			this.trigger('onMove', this._mouse);
		}
	}


	_onUp() {
		this._isMouseDown = false;
	}
}


export default TouchDetector;