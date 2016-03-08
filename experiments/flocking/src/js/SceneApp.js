// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSimulation from './ViewSimulation';
import ViewAddVel from './ViewAddVel';
import ViewBall from './ViewBall';
import ViewPlanes from './ViewPlanes';
import ClusterChecker from './ClusterChecker';
import AudioPlayer from './AudioPlayer';

let clusterfck = require("clusterfck");

let GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		GL = alfrid.GL;
		GL.enableAlphaBlending();
		super();
		this.orbitalControl._rx.value = 0.3;

		let size             = params.numParticles;
		this.pixels          = new Float32Array(4 * size * size);
		this._clusterChecker = new ClusterChecker( (num)=>this._onClusterCreated(num));
		this._audioPlayer    = new AudioPlayer();
	}


	_initTextures() {
		console.log('Init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}

		function clearFbo(fbo) {
			fbo.bind();
			GL.clear(0, 0, 0, 0);
			fbo.unbind();
		}

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra  	= new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboSpeed  	= new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos.id = 1;

		clearFbo(this._fboCurrentPos);
		clearFbo(this._fboTargetPos);
		clearFbo(this._fboCurrentVel);
		clearFbo(this._fboTargetVel);
		clearFbo(this._fboExtra);
		clearFbo(this._fboSpeed);
	}
	

	_initViews() {
		console.log('Init Views');
		this._bAxis      = new alfrid.BatchAxis();
		this._bDotsPlane = new alfrid.BatchDotsPlane();
		this._bCopy 	 = new alfrid.BatchCopy();

		this._vRender	 = new ViewRender();
		this._vSim		 = new ViewSimulation();
		this._vAddVel	 = new ViewAddVel();
		this._vBall		 = new ViewBall();

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

		GL.setMatrices(this.camera);
	}


	_onClusterCreated(num) {
		for(let i=0; i<num; i++) {
			// this._audioPlayer.playNextNote();
		}
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

		//	SWAPPING : PING PONG
		let tmpVel          = this._fboCurrentVel;
		this._fboCurrentVel = this._fboTargetVel;
		this._fboTargetVel  = tmpVel;

		let tmpPos          = this._fboCurrentPos;
		this._fboCurrentPos = this._fboTargetPos;
		this._fboTargetPos  = tmpPos;

	}


	render() {
		let traceTime = false;
		if(traceTime) console.time('read pixels');
		this._readPositions();
		if(traceTime) console.timeEnd('read pixels');
		if(traceTime) console.time('rendering');
		this._doRender();
		if(traceTime) console.timeEnd('rendering');
		if(traceTime) console.time('clustering');
		this._clustering();
		if(traceTime) console.timeEnd('clustering');
	}


	_clustering() {

		this._clusterChecker.check(this.pixels)
		if(params.showCenteroid) {
			for(let i=0; i<this._clusterChecker.clusters.length ; i++ ) {
				let cluster = this._clusterChecker.clusters[i];
				this._vBall.render(cluster.position, .0 + cluster.strength * 2.0, [1, 0, 0]);	
			}	
		}
		

	}


	_readPositions() {
		let size = this._fboCurrentPos.width;
		let gl = GL.gl;
		this._fboCurrentPos.bind();
		gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, this.pixels);
		this._fboCurrentPos.unbind();

	}


	_doRender() {
		this.updateFbo();

		// this.orbitalControl._ry.value += -.003;


		if(params.showWires && 0) {
			this._bAxis.draw();
			this._bDotsPlane.draw();	
		}
		
		this._vRender.render(this._fboCurrentPos.getTexture(), this._fboExtra.getTexture());

		let debugSize = 256/2;

		/*
		GL.viewport(0, 0, debugSize, debugSize);
		this._bCopy.draw(this._fboCurrentPos.getTexture());

		GL.viewport(debugSize, 0, debugSize, debugSize);
		this._bCopy.draw(this._fboTargetVel.getTexture());

		GL.viewport(debugSize*2, 0, debugSize, debugSize);
		this._bCopy.draw(this._fboExtra.getTexture());

		GL.viewport(debugSize*3, 0, debugSize, debugSize);
		this._bCopy.draw(this._fboSpeed.getTexture());
		*/
	}

}


export default SceneApp;