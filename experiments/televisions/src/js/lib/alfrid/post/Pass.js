// Pass.js

import GLShader from '../GLShader';
import FrameBuffer from '../FrameBuffer';
import ShaderLibs from '../utils/ShaderLibs';

class Pass {
	constructor(mSource, mWidth = 0, mHeight = 0, mParams = {}) {
		this.shader = new GLShader(ShaderLibs.bigTriangleVert, mSource);

		this._width = mWidth;
		this._height = mHeight;
		this._uniforms = {};
		this._hasOwnFbo = this._width > 0 && this._width > 0;
		this._uniforms = {};

		if (this._hasOwnFbo) {
			this._fbo = new FrameBuffer(this._width, this.height, mParmas);
		}
	}


	uniform(mName, mValue) {
		this._uniforms[mName] = mValue;
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform('texture', 'uniform1i', 0);
		texture.bind(0);

		this.shader.uniform(this._uniforms);
	}

	get width() {	return this._width;	}
	get height() {	return this._height;	}
	get fbo() {	return this._fbo;	}
	get hasFbo() {	return this._hasOwnFbo; }
}

export default Pass;