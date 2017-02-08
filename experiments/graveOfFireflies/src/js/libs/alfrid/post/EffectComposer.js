// EffectComposer.js

'use strict';

// import GL from '../GLTool';
import FrameBuffer from '../FrameBuffer';
import Geom from '../Geom';


class EffectComposer {
	constructor(mWidth, mHeight, mParameters = {}) {
		this._fbo = new FrameBuffer(mWidth, mHeight, mParameters);
		this._fboTarget = new FrameBuffer(mWidth, mHeight, mParameters);

		this._mesh = Geom.bigTriangle();

		this._passes = [];
	}

	addPass(pass) {
		this._passes.push(pass);
	}


	render() {

		for(let i = 0; i < this._passes.length; i++) {

			this._swap();
		}
	}


	_swap() {
		const tmp = this._fbo;
		this._fbo = this._fboTarget;
		this._fboTarget = tmp;
	}
}


export default EffectComposer;