// FboPingPong.js

import alfrid from 'alfrid';


class FboPingPong {

	constructor(width, height, params) {
		const a = new alfrid.FrameBuffer(width, height, params);
		const b = new alfrid.FrameBuffer(width, height, params);

		this._fbo = [a, b];
	}


	swap() {
		this._fbo = this._fbo.reverse();
	}


	get read() {
		return this._fbo[0];
	}


	get write() {
		return this._fbo[1];
	}


	get readTexture() {
		return this._fbo[0].getTexture();
	}


	get writeTexture() {
		return this._fbo[1].getTexture();
	}
}


export default FboPingPong;