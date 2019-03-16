// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';

import getNormalTexture from './getNormalTexture';
import ViewSphere from './ViewSphere';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';

import ViewBackground from './ViewBackground';


class SceneApp extends Scene {
	constructor() {

		super();

		this.cameraFront = new alfrid.CameraPerspective();
		const fov = 90;
		this.cameraFront.setPerspective(fov * Math.PI / 180, GL.aspectRatio, 0.1, 100);
		this.cameraFront.lookAt([0, 0, 10], [0, 0, 0]);
		this._count = 0;

		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.radius.setTo(5);
		this.orbitalControl.rx.value = -1.4207963267948964;
		this.orbitalControl.ry.value = 5.67;

		this._posLight = [0, 10, 2];
		this._cameraLight = new alfrid.CameraOrtho();
		const s = 10;
		this._cameraLight.ortho(-s, s, -s, s, 10, 100);
		this._cameraLight.lookAt(this._posLight, [0, 0, 0], [0, 1, 0]);
		// this._cameraLight.lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);


		// this._vAxis = vec3.fromValues(0, 1, 0);
		this._vAxis = vec3.fromValues(0, 0, 1);


		this.textureParticle = getNormalTexture(this.cameraFront);
	}


	_initTextures() {
		console.log('init textures');

		const numParticles = Config.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 4);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 4);
		this._fboShadow = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});

		const fboSize = 2048;
		this._fbo = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vSphere = new ViewSphere();
		this._vBg = new ViewBackground();


		//	views
		this._vRender = new ViewRender();
		this._vRenderShadow = new ViewRenderShadow();
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


	_renderBG() {
		this._fbo.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		this._vSphere.render();
		this._fbo.unbind();
	}


	updateFbo() {
		GL.setMatrices(this.cameraFront);
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(2),
			this._fboCurrent.getTexture(3),
			this.textureBG
			);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

	}

	_renderParticles() {
		let p = this._count / Config.skipCount;
		this._vRender.render(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p, 
			this._fboCurrent.getTexture(2),
			this._shadowMatrix, 
			this._fboShadow.getDepthTexture(),
			this.textureParticle,
			this.textureBG,
			this._posLight,
			this._fboCurrent.getTexture(3)
		);
	}

	_renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);
		let p = this._count / Config.skipCount;
		this._vRenderShadow.render(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p, 
			this._fboCurrent.getTexture(2)
		);
		this._fboShadow.unbind();
	}


	render() {
		this._count ++;
		if(this._count % Config.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		this._renderShadowMap();

		this._renderBG();
		GL.clear(0, 0, 0, 0);

		GL.disable(GL.DEPTH_TEST);
		this._bCopy.draw(this.textureBG);
		// this._vBg.render(this.textureBG, this._vRender.textureColor);
		GL.enable(GL.DEPTH_TEST);


		// let s = .02;
		// GL.setMatrices(this.camera);
		// this._bBall.draw([0, 0, 0], [s, s, s], [1, 1, 0])
		// this._bBall.draw(this._vAxis, [s, s, s], [1, 0, 0])


		GL.setMatrices(this.cameraFront);
		this._renderParticles();

		if(Math.random() > .99) {
			console.log(this.orbitalControl.rx.value, this.orbitalControl.ry.value);
		}
	}


	toResize(w, h) {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		w = w || innerWidth;
		h = h || innerHeight;
		GL.setSize(w, h);
		let tw = Math.min(w, innerWidth);
		let th = Math.min(h, innerHeight);

		const sx = innerWidth / w;
		const sy = innerHeight / h;
		const scale = Math.min(sx, sy);
		tw = w * scale;
		th = h * scale;

		GL.canvas.style.width = `${tw}px`;
		GL.canvas.style.height = `${th}px`;
		this.camera.setAspectRatio(GL.aspectRatio);
		this.cameraFront.setAspectRatio(GL.aspectRatio);
	}

	resize() {
		this.toResize(window.innerWidth, window.innerHeight);
	}


	get textureBG() {
		return this._fbo.getTexture();
	}
}


export default SceneApp;