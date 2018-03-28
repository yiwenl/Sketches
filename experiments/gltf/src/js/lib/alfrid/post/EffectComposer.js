// EffectComposer.js

import Pass from './Pass';
import GL from '../GLTool';
import Geom from '../Geom';
import FrameBuffer from '../FrameBuffer';

class EffectComposer {
	constructor(mWidth, mHeight, mParmas = {}) {
		this._width = mWidth || GL.width;
		this._height = mHeight || GL.height;

		this._params = {};
		this.setSize(mWidth, mHeight);
		this._mesh = Geom.bigTriangle();
		this._passes = [];
		this._returnTexture;
	}


	addPass(pass) {
		if(pass.passes) {
			this.addPass(pass.passes);
			return;
		}
		
		if (pass.length) {
			for(let i = 0; i < pass.length; i++) {
				this._passes.push(pass[i]);
			}
		} else {
			this._passes.push(pass);
		}
	}

	render(mSource) {
		let source = mSource;
		let fboTarget;

		this._passes.forEach((pass) => {

			//	get target
			if(pass.hasFbo) {
				fboTarget = pass.fbo;
			} else {
				fboTarget = this._fboTarget;
			}

			//	render
			fboTarget.bind();
			GL.clear(0, 0, 0, 0);
			pass.render(source);
			GL.draw(this._mesh);
			fboTarget.unbind();

			//	reset source
			if(pass.hasFbo) {
				source = pass.fbo.getTexture();
			} else {
				this._swap();	
				source = this._fboCurrent.getTexture();
			}
		});

		this._returnTexture = source;

		return source;
	}


	_swap() {
		const tmp = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget = tmp;

		this._current = this._fboCurrent;
		this._target = this._fboTarget;
	}

	setSize(mWidth, mHeight) {
		this._width = mWidth;
		this._height = mHeight;
		this._fboCurrent = new FrameBuffer(this._width, this._height, this._params);
		this._fboTarget = new FrameBuffer(this._width, this._height, this._params);
	}

	get passes() {
		return this._passes;
	}

	getTexture() {
		return this._returnTexture;
	}
}

export default EffectComposer;