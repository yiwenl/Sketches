// FboArray.js

import alfrid from 'alfrid';

class FboArray {

	constructor(mNum, width, height, params={}, mNumTargets=1) {
		this._fbos = [];


		for(let i=0; i<mNum; i++) {
			const fbo = new alfrid.FrameBuffer(width, height, params, mNumTargets);
			this._fbos.push(fbo);
		}

	}


	swap() {
		const a = this._fbos.shift();
		this._fbos.push(a);
	}


	get read() {
		return this._fbos[this._fbos.length - 1];
	}


	get write() {
		return this._fbos[0];
	}


	get all() {
		return this._fbos;
	}

}


export default FboArray;