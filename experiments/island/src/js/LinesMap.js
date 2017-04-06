// LinesMap.js
import alfrid, { GL } from 'alfrid';

class LinesMap {
	constructor() {
		this._init();
	}

	_init() {
		this._lineMaps = [];

		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		for(let i=0; i<params.numSeg; i++) {
			const fbo = new alfrid.FrameBuffer(numParticles, numParticles, o);
			this._lineMaps.push(fbo);
		}


		this._bCopy = new alfrid.BatchCopy();
	}
	

	reset(fbo) {
		for(let i=0; i<this._lineMaps.length; i++) {
			this.save(fbo);
		}
	}


	save(fbo) {
		const targetFbo = this._lineMaps.pop();
		targetFbo.bind();
		GL.clear(0, 0, 0, 0);
		this._bCopy.draw(fbo.getTexture());
		targetFbo.unbind();
		this._lineMaps.unshift(targetFbo);
	}


	get maps() {
		return this._lineMaps;
	}
}


export default LinesMap;