// Fbo.js

import alfrid from 'alfrid';

class Fbo {
	constructor(width, height, options, numTargets=1) {
		this._fbos = [
			new alfrid.FrameBuffer(width, height, options, numTargets),
			new alfrid.FrameBuffer(width, height, options, numTargets)
		]
	}


	swap() {
		this._fbos.reverse();
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


export default Fbo;