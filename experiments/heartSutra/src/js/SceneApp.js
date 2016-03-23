// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewSave from './ViewSave';
import ViewSimulation from './ViewSimulation';
import ViewAddVel from './ViewAddVel';
import ViewPlanes from './ViewPlanes';
import ViewPost from './ViewPost';
import ViewBelt from './ViewBelt';

let clusterfck = require("clusterfck");

let GL = alfrid.GL;;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this.camera.setPerspective(Math.PI * 0.5, GL.aspectRatio, 1, 100);
		this.orbitalControl.radius.setTo(10);
		this.orbitalControl.radius.value = 8;
		this.orbitalControl.radius.limit(1, 11);

		this._count = 0;
	}


	_initTextures() {
		console.log('Init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra      = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboSpeed      = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboRender     = new alfrid.FrameBuffer(GL.width, GL.height);


		this._fbos = [];
		for(let i=0; i<params.numSeg; i++) {
			let fbo = new alfrid.FrameBuffer(numParticles, numParticles, o);
			this._fbos.push(fbo);
		}


	}
	

	_initViews() {
		console.log('Init Views');
		this._bCopy   = new alfrid.BatchCopy();
		
		this._vSim    = new ViewSimulation();
		this._vAddVel = new ViewAddVel();
		this._vPlanes = new ViewPlanes();
		this._vPost   = new ViewPost();
		this._vBelt   = new ViewBelt();

		//	SAVE INIT POSITIONS
		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrentPos.bind();
		this._vSave.render(0);
		this._fboCurrentPos.unbind();

		this._fboExtra.bind();
		this._vSave.render(1);
		this._fboExtra.unbind();

		this._fboSpeed.bind();
		this._vSave.render(2);
		this._fboSpeed.unbind();

		this._fboTargetPos.bind();
		this._bCopy.draw(this._fboCurrentPos.getTexture());
		this._fboTargetPos.unbind();

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		//	Update Velocity : bind target Velocity, render simulation with current velocity / current position
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture(), this._fboSpeed.getTexture() );
		this._fboTargetVel.unbind();


		//	Update position : bind target Position, render addVel with current position / target velocity;
		this._fboTargetPos.bind();
		GL.clear(0, 0, 0, 1);
		this._vAddVel.render(this._fboCurrentPos.getTexture(), this._fboTargetVel.getTexture());
		this._fboTargetPos.unbind();

		let fbo = this._fbos.shift();
		fbo.bind();
		GL.clear(0, 0, 0, 0);
		this._bCopy.draw(this._fboTargetPos.getTexture());
		fbo.unbind();
		this._fbos.push(fbo);

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

		// this.orbitalControl._ry.value += -.01;
		this._vPlanes.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture(), p);
	}


	resize() {
		console.log('Resizing');
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
	}

}


export default SceneApp;