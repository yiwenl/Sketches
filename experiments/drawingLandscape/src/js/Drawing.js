// Drawing.js

import { EventDispatcher } from 'alfrid';

class Drawing extends EventDispatcher {
	constructor() {
		super();

		window.addEventListener('mousedown', (e)=>this._onDown(e));
		window.addEventListener('mousemove', (e)=>this._onMove(e));
		window.addEventListener('mouseup', (e)=>this._onUp(e));

		this._isLocked = true;
		this._isMouseDown = false;
	}


	lock(mValue) {
		this._isLocked = mValue;
	}


	_onDown(e) {
		if(this._isLocked) return;
		this._isMouseDown = true;
	}


	_onMove(e) {
		if(this._isLocked) return;
	}


	_onUp(e) {
		if(this._isLocked) return;
		this._isMouseDown = false;

		this.trigger('mouseup', {});
	}
}


export default Drawing;
