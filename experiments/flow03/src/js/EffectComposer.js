// EffectComposer.js

import FboPingPong from './FboPingPong';
import alfrid, { GL } from 'alfrid';

class EffectComposer {
	constructor(mWidth, mHeight, mOptions = {}) {
		this._fbo = new FboPingPong(mWidth, mHeight, mOptions);
		this._passes = [];
		this._mesh = alfrid.Geom.bigTriangle();
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
		this._passes.forEach( (pass, i) => {
			this._fbo.write.bind();
			GL.clear(0, 0, 0, 0);
			if(i === 0) {
				pass.render(mSource);
			} else {
				pass.render(this._fbo.readTexture);
			}
			GL.draw(this._mesh);
			this._fbo.write.unbind();

			this._fbo.swap();
		})
	}


	getTexture() {
		return this._fbo.readTexture;
	}

	get texture() {
		return this._fbo.readTexture;
	}

}

export default EffectComposer;