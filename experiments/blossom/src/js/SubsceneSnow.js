// SubsceneSnow.js

import alfrid , { GL } from 'alfrid';
import ViewSaveSnow from './ViewSaveSnow';
import ViewRenderSnow from './ViewRenderSnow';
import ViewAddVelSnow from './ViewAddVelSnow';
import ViewSimSnow from './ViewSimSnow';

class SubsceneSnow {
	constructor(scene, bCopy) {
		this.scene = scene;
		this._bCopy = bCopy;
		this._count = Math.floor(params.skipCount/2);
		this._init();
	}

	_init() {
		//	particles
		const numParticles = params.numSnow;
		const o = { minFilter:GL.NEAREST, magFilter:GL.NEAREST };

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra  	= new alfrid.FrameBuffer(numParticles, numParticles, o);

		this._vRender = new ViewRenderSnow();
		this._vAddVel = new ViewAddVelSnow();
		this._vSim = new ViewSimSnow();

		this._vSave = new ViewSaveSnow();
		GL.setMatrices(this.scene.cameraOrtho);
		// 	view save pos
		this._fboCurrentPos.bind();
		this._vSave.render(0);
		this._fboCurrentPos.unbind();

		//	view save extra
		this._fboExtra.bind();
		this._vSave.render(1);
		this._fboExtra.unbind();

		//	copy to target pos
		this._fboTargetPos.bind();
		this._bCopy.draw(this._fboCurrentPos.getTexture());
		this._fboTargetPos.unbind();

		GL.setMatrices(this.scene.camera);
	}

	updateFbo() {
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture());
		this._fboTargetVel.unbind();

		this._fboTargetPos.bind();
		GL.clear(0, 0, 0, 1);
		this._vAddVel.render(this._fboCurrentPos.getTexture(), this._fboTargetVel.getTexture());
		this._fboTargetPos.unbind();

		//	SWAPPING : PING PONG
		let tmpVel          = this._fboCurrentVel;
		this._fboCurrentVel = this._fboTargetVel;
		this._fboTargetVel  = tmpVel;

		let tmpPos          = this._fboCurrentPos;
		this._fboCurrentPos = this._fboTargetPos;
		this._fboTargetPos  = tmpPos;
	}


	render() {
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count/params.skipCount;

		//	view snow rendering
		this._vRender.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, this._fboExtra.getTexture());	
	}
}

export default SubsceneSnow;