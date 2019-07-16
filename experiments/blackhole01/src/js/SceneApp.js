// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewBackground from './ViewBackground';
import ViewComposeBg from './ViewComposeBg';
// import ViewDimensions from './ViewDimensions';
import FlowControl from './FlowControl';
import FboPingPong from './FboPingPong';

import PassBloom from './PassBloom';
import ViewFXAA from './ViewFXAA';
import Trails from './Trails';
import ParticleSimulation from './ParticleSimulation';

import Assets from './Assets';
import Time from './Time';

import fs from 'shaders/normal.frag';
import Config from './Config';
import ParticleTexture from './ParticleTexture';

import { saveImage, formNumber, biasMatrix } from './utils';


const graphSize = 2000;
let fboScale = 1;

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

const GENERAL_SCALE = 2;
const TARGET_WIDTH = 1920 * GENERAL_SCALE;
const TARGET_HEIGHT = 1080/2 * GENERAL_SCALE;
// const FPS = 1;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		FlowControl.init();
		GL.enableAlphaBlending();



		this._isRunning = false;
		this.camera.setPerspective(Math.PI/2, 1, .1, 100);
		this.orbitalControl.radius.value = 9.5;
		// const r = 0.2;
		// this.orbitalControl.rx.limit(-r, r);
		// this.orbitalControl.ry.limit(-r, r);
		this.orbitalControl.lock();

		this._cameraLight = new alfrid.CameraOrtho();
		const s = 15;
		this._cameraLight.ortho(-s, s, -s, s, 1, 50);
		this._cameraLight.lookAt([Config.lightX, Config.lightY, Config.lightZ], [0, 0, 0]);

		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, biasMatrix, this._shadowMatrix);


		this._fboBg1.bind();
		GL.clear(0, 0, 0, 0);
		this._vBg.render();
		this._fboBg1.unbind();

		this.mtxModel = mat4.create();
		this.touch = [0, 0, 0];

		if(!Config.debugVisual) {
			setInterval(()=>this.loop(), 1000/Config.fps);	
		} else {
			this.start();
		}

		this.resize();


		window.addEventListener('mousemove', (e) => {
			let r = 0.3;
			let x = e.clientX / GL.width - 0.5;
			let y = e.clientY / GL.height - 0.5;

			this.orbitalControl.rx.value = y * r * 0.5;
			this.orbitalControl.ry.value = x * r;

		})
	}


	updateLight() {
		mat4.identity(this._shadowMatrix);
		this._cameraLight.lookAt([Config.lightX, Config.lightY, Config.lightZ], [0, 0, 0]);
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, biasMatrix, this._shadowMatrix);
	}


	_initTextures() {
		this.resize();


		const oSettings = {	minFilter:GL.LINEAR, magFilter:GL.LINEAR };
		this._fboShadow = new alfrid.FrameBuffer(1024, 1024, oSettings);


		const fboSize = 2048;

		this._fboBg1 = new alfrid.FrameBuffer(fboSize, fboSize, oSettings);
		this._fboBg2 = new alfrid.FrameBuffer(fboSize, fboSize, oSettings);

		this._fboRender = new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale);

		this._textureParticle = new ParticleTexture();
	}


	_initViews() {
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		// this._bBall = new alfrid.BatchBall();

		this._vBg = new ViewBackground();
		this._vBgCompose = new ViewComposeBg();
		// this._vDimensions = new ViewDimensions();

		//	post effects
		this._vFxaa     = new ViewFXAA();
		this._passBloom = new PassBloom(5, 1);


		//	views
		this._vRender = new ViewRender();
		this._vRenderShadow = new ViewRenderShadow();
		this._vSim 	  = new ViewSim();

		this._vSave = new ViewSave();


		this._particleSets = [];

		let i = Config.numParticleSets 
		while(i--) {
			const particleSim = new ParticleSimulation();
			this._particleSets.push(particleSim);
		}
		this._trail = new Trails();

		GL.setMatrices(this.camera);
	}


	updateFbo(fboParticle) {
		fboParticle.write.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			fboParticle.read.getTexture(1), 
			fboParticle.read.getTexture(0), 
			fboParticle.read.getTexture(2),
			fboParticle.read.getTexture(3),
			false
			);
		fboParticle.write.unbind();
		fboParticle.swap();


	}

	_renderParticles(fboParticle) {
		this._vRender.render(
			fboParticle.read.getTexture(0), 
			fboParticle.read.getTexture(2),
			this._shadowMatrix, 
			this._fboShadow.getDepthTexture(),
			this.textureParticle,
			fboParticle.read.getTexture(3),
			this._fboBg1.getTexture(),
			this._fboBg2.getTexture(),
		);
	}

	_renderShadowMap(fboParticle) {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);
		this._vRenderShadow.render(
			fboParticle.read.getTexture(0),
			fboParticle.read.getTexture(2),
		);
		this._fboShadow.unbind();
	}


	start() {
		FlowControl.start();
		this.resume();
	}


	pause() {	this._isRunning = false;	}


	resume() {	this._isRunning = true;	}


	render() {
		if(Config.debugVisual) {
			this.loop();
		}
	}


	loop() {
	
		if(!this._isRunning ) {
			return;
		}
		Time.tick();
		if(Time.frame > FlowControl.totalFrames + 10) {
			return;
		}
		FlowControl.update();
		this._particleSets.forEach( particleSim => particleSim.update());

		this._trail.update(this.touch);

		GL.enable(GL.DEPTH_TEST);
		this._particleSets.forEach( particleSim => {
			this._renderShadowMap(particleSim.fboParticle);
		});


		this._fboRender.bind();

		GL.clear(0, 0, 0, 1);
		GL.setMatrices(this.camera);

		GL.disable(GL.DEPTH_TEST);

		
		this._vBgCompose.render(Assets.get('bg'));
		// if(Config.showDimensions) {	this._vDimensions.render();		}

		GL.enable(GL.DEPTH_TEST);

		let size = graphSize;
		let x = TARGET_WIDTH * 0.5 * this._canvasScale - size/2;
		let y = TARGET_HEIGHT * 0.5 * this._canvasScale - size/2;

		GL.viewport(x * this._innerScale, y * this._innerScale, size * this._innerScale, size * this._innerScale);


		if(Config.showLines) {	this._trail.render(this._fboBg1.getTexture(), this._fboBg2.getTexture());	}
		if(Config.showParticles) {	
			this._particleSets.forEach( particleSim => {
				this._renderParticles(particleSim.fboParticle);
			});
		}
		
		
		let s = 0.2;
		// this._bBall.draw(this.touch, [s, s, s], [1, 1, 1]);

		this._fboRender.unbind();

		GL.disable(GL.DEPTH_TEST);


		//	POST EFFECTS

		this._passBloom.render(this._fboRender.getTexture());
		this._vFxaa.render(this._fboRender.getTexture(), this._passBloom.getTexture());

		if(Config.exportFrame && !Config.debugVisual) {
			const num = formNumber(Time.frame)
			saveImage(GL.canvas, `BlackHole${num}`);	
		}
		
	}


	resize(w, h) {
		let width = TARGET_WIDTH;
		let height = TARGET_HEIGHT;

		this._toReize( w || width, h || height);
	}

	_toReize(width, height) {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		const ratio = width / height;

		let sx = innerWidth / width;
		let sy = innerHeight / height;
		let scale = Math.min(sx, sy);
		this._canvasScale = innerWidth / TARGET_WIDTH;

		let w = width * scale;
		let h = height * scale;

		scale = TARGET_HEIGHT / h;
		// scale = Math.min(scale, 3.0);


		if(!Config.fullscaleCanvas) {
			scale = 1;
		}

		this._innerScale = scale;
		console.log('this._innerScale', this._innerScale);

		GL.setSize(w * scale, h * scale);
		GL.canvas.style.width = `${w}px`;
		GL.canvas.style.height = `${h}px`;
		GL.canvas.style.top = `${(innerHeight - h) * 0.5}px`;
		GL.canvas.style.left = `${(innerWidth - w) * 0.5}px`;

		if(this._fboBg1) {
			this._fboBg1.bind();
			GL.clear(0, 0, 0, 0);
			this._vBg.render();
			this._fboBg1.unbind();

			this._fboBg2.bind();
			GL.clear(0, 0, 0, 0);
			this._vBg.render(Assets.get('nebula3'));
			this._fboBg2.unbind();	
		}
		
	}


	get textureParticle() {
		return this._textureParticle.getTexture();
	}
}


export default SceneApp;