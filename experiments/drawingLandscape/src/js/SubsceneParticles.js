// SubsceneParticles.js

import alfrid, { GL, FrameBuffer } from 'alfrid';

class SubsceneParticles {

	constructor() {
		this._initTextures();
		this._initViews();
	}


	_initTextures() {
		const numParticles = params.numParticles;
		const o = { minFilter: GL.NEAREST, magFilter: GL.NEAREST };

		/*
			fboCurrPos, fboNextPos
			fboCurrVel, fboNextVel
			fboCurrLife, fboNextLife
		*/

		this._fboCurrPos = new FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos = new FrameBuffer(numParticles, numParticles, o);

		this._fboCurrVel = new FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel = new FrameBuffer(numParticles, numParticles, o);

		this._fboCurrLife = new FrameBuffer(numParticles, numParticles, o);
		this._fboTargetLife = new FrameBuffer(numParticles, numParticles, o);
	}


	_initViews() {
		/*
			View save
			View simulation
			View addVel
			View addLife
			View Render
		*/
	}


	reset( points ) {
		/*
			View Save new Poisitions
			View Save reset fboLife
			Clear fboVels
		*/
	}


	updateFbo() {

	}


	render() {

	}

}

export default SubsceneParticles;