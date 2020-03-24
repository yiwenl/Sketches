// FboPingPong.js

import alfrid from 'alfrid';

class FboPingPong {
	constructor(width, height, params={}) {
		const a = new alfrid.FrameBuffer(width, height, params);
		const b = new alfrid.FrameBuffer(width, height, params);

		this._fbos = [a, b];
	}

	swap() {
		this._fbos = this._fbos.reverse();
	}

	get read() {	this._fbos[0];	}
	get write() {	this._fbos[1];	}

	get readTexture() {		this._fbos[0].getTexture();	}
	get writeTexture() {	this._fbos[1].getTexture();	}
}

export default FboPingPong;