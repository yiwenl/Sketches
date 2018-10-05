// FboPingPong.js
import alfrid from 'alfrid';

class FboPingPong {
	constructor(mWidth, mHeight, mParams = {}) {
		const a = new alfrid.FrameBuffer(mWidth, mHeight, mParams);
		const b = new alfrid.FrameBuffer(mWidth, mHeight, mParams);

		this._fbos = [a, b];
	}

	swap() {
		this._fbos = this._fbos.reverse();
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

}

export { FboPingPong };