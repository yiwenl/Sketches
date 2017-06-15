// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 20;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		this._isPaused = false;
		
		const numParticles = params.numParticles;
		const arraysize = numParticles * numParticles * 4;
		this._pixelsCurr = new Float32Array(arraysize);
		this._pixelsNext = new Float32Array(arraysize);

		// this.orbitalControl.center[1] = 5;
		window.addEventListener('keydown', (e)=>this._onKey(e));
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);


		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboCurrent.unbind();

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboTarget.unbind();

		GL.setMatrices(this.camera);
	}


	_onKey(e) {
		console.log('Key :', e.keyCode);

		if(e.keyCode === 32) {	//	space
			this._isPaused = !this._isPaused;
		} else if(e.keyCode === 83) {	//	S
			this._isPaused = true;
			console.log('Saving position');
			this._readPositions();
		}
		
	}

	_readPositions() {
		this._fboTarget.bind();
		GL.gl.readPixels(0, 0, params.numParticles, params.numParticles, GL.gl.RGBA, GL.gl.FLOAT, this._pixelsCurr);
		this._fboTarget.unbind();

		this._fboCurrent.bind();
		GL.gl.readPixels(0, 0, params.numParticles, params.numParticles, GL.gl.RGBA, GL.gl.FLOAT, this._pixelsNext);
		this._fboCurrent.unbind();


		const posCurr = [], posNext = [];

		for(let i=0; i<this._pixelsCurr.length; i+=4) {
			posCurr.push(this._pixelsCurr[i]);
			posCurr.push(this._pixelsCurr[i+1]);
			posCurr.push(this._pixelsCurr[i+2]);

			posNext.push(this._pixelsNext[i]);
			posNext.push(this._pixelsNext[i+1]);
			posNext.push(this._pixelsNext[i+2]);
		}


		socket.emit('particlePosition', posCurr, posNext);
	}


	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2));
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

	}


	render() {

		if(!this._isPaused) {
			this._count ++;
			if(this._count % params.skipCount == 0) {
				this._count = 0;
				this.updateFbo();

				// this._readPositions();
			}	
		}
		

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);
		// this._bAxis.draw();
		this._bDots.draw();

		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;