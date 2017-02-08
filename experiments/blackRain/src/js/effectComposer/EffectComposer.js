// EffectComposer.js

import { Geom, GL, FrameBuffer } from 'alfrid';

class EffectComposer {

	constructor(mWidth, mHeight, mParmas = {}) {
		this._width = mWidth;
		this._height = mHeight;

		this._fboCurrent = new FrameBuffer(this._width, this._height, mParmas);
		this._fboTarget = new FrameBuffer(this._width, this._height, mParmas);
		this._mesh = Geom.bigTriangle();
		this._passes = [];
		this._returnTexture;
	}


	addPass(pass) {
		if(pass.getPasses) {
			this.addPass(pass.getPasses());
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


	render(mSourceTexture, rect) {
		let haveOwnFbo = false;
		let fboTarget;
		let source;
		let prevSource;

		this._passes.map((pass, i) => {
			if(i === 0) {
				source = mSourceTexture;
			} else {
				if(prevSource) {
					source = prevSource;
				} else {
					source = this._fboCurrent.getTexture();
				}
			}

			haveOwnFbo = pass.hasFbo;

			if(haveOwnFbo) {
				fboTarget = pass.fbo;
			} else {
				fboTarget = this._fboTarget;
			}


			fboTarget.bind();
			if(rect) {
				GL.viewport(rect.x, rect.y, rect.w, rect.h);
			}
			GL.clear(0, 0, 0, 0);
			pass.render(source);
			GL.draw(this._mesh);
			fboTarget.unbind();

			if(!haveOwnFbo) {
				this._swap();	
				prevSource = null;
				this._returnTexture = this._fboCurrent.getTexture();
			} else {
				prevSource = fboTarget.getTexture();
				this._returnTexture = prevSource;
			}
			
		});	

		return this._returnTexture;
	}

	_swap() {
		const tmp = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget = tmp;

		this._current = this._fboCurrent;
		this._target = this._fboTarget;
	}


	getTexture() {
		return this._returnTexture;
	}
}


export default EffectComposer;