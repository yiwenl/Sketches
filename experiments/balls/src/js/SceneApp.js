// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewBall from './ViewBall';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/4, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 30;

		this.currFrame = 0;


		const numParticles = params.numParticles;
		const arraysize = numParticles * numParticles * 4;
		this._pixels = new Float32Array(arraysize);

		this._isSending = false;
		this._frameCount = 0;

		// gui.add(this, '_sendFrame');
		// gui.add(this, '_readPositions');
		// gui.add(this, 'startTransmit');

		window.addEventListener('resize', ()=>this.resize());
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
		this._vBall = new ViewBall();


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


	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2));
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;
	}


	_readPositions() {
		this._fboTarget.bind();
		GL.gl.readPixels(0, 0, params.numParticles, params.numParticles, GL.gl.RGBA, GL.gl.FLOAT, this._pixels);
		this._fboTarget.unbind();

		const positions = [];
		for(let i=0; i<this._pixels.length; i+=4) {
			positions.push(this._pixels[i]);
			positions.push(this._pixels[i+1]);
			positions.push(this._pixels[i+2]);
		}

		socket.emit('position', positions);
	}


	_sendFrame() {
		socket.emit('frame', this.currFrame);
		this.currFrame ++;
	}


	startTransmit() {
		this._isSending = true;
		this._frameCount = 0;
		this.currFrame = 0;
		const fps = 15;
		this._interval = setInterval(()=>this.toRender(), 1000/fps);
	}


	render() {
		if(!this._isSending) {
			this.toRender();
		}
	}


	toRender() {
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);
		// this._bAxis.draw();
		this._bDots.draw();
		// const s = 6;
		// const g = .2;
		// this._bBall.draw([0, 0, 0], [s, s, s], [g, g, g]);

		this._vBall.render();

		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));

		this._frameCount ++;
		const totalFrame = 300;
		if(this._frameCount == totalFrame) {
			clearInterval(this._interval);
		}

		if(this._isSending) {
			this._sendFrame();
			alfrid.Scheduler.next(()=> {
				this._readPositions();	
			});
		}
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;