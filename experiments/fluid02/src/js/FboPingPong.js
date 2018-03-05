// FboPingPong.js

import alfrid from 'alfrid';

class FboPingPong {
	constructor(mWidth, mHeight, mSettings={}) {
		const fbo0 = new alfrid.FrameBuffer(mWidth, mHeight, mSettings);
		const fbo1 = new alfrid.FrameBuffer(mWidth, mHeight, mSettings);

		fbo0.id = 'fbo0';
		fbo1.id = 'fbo1';

		this._fbos = [fbo0, fbo1];
	}


	get read() {
		return this._fbos[0];
	}

	get write() {
		return this._fbos[1];
	}


	get readTexture() {
		return this._fbos[0].getTexture();
	}

	get writeTexture() {
		return this._fbos[1].getTexture();
	}

	swap() {
		this._fbos.reverse();
	}
}

export default FboPingPong;