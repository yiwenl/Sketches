// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';

import ViewNoise from './ViewNoise';
import ViewNoise2 from './ViewNoise2';
import ViewParticles from './ViewParticles';
import fs from 'shaders/normal.frag';
import Config from './Config';
import Settings from './Settings';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		Settings.init();

		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.setTo(5);
		this.orbitalControl.radius.value = 4;
		this.orbitalControl.radius.limit(3, 6);
		this.orbitalControl.rx.value = 0.2;

		this._cameraLight = new alfrid.CameraOrtho();
		const s = 6;
		this._cameraLight.ortho(-s, s, -s, s, .1, 30);
		// this._cameraLight.lookAt([0, 10, 0.1], [0, 0, 0], [0, 1, 0]);
		const v = vec3.fromValues(Config.lightX, Config.lightY, Config.lightZ);
		vec3.scale(v, v, 8);
		this.lightPos = v;
		this._cameraLight.lookAt(v, [0, 0, 0], [0, 1, 0]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);

		//	get particle normal map
		const size = 1;
		this.cameraOrtho.ortho(-size, size, -size, size);
		this.cameraOrtho.lookAt([0, 0, 3], [0, 0, 0]);
		const mesh = alfrid.Geom.sphere(1, 12);
		const shader = new alfrid.GLShader(null, fs);
		this._fboParticle.bind();
		// GL.clear(1, 0, 0, 1);
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraOrtho);
		shader.bind();
		GL.draw(mesh);
		this._fboParticle.unbind();


		setTimeout(()=> {
			// gui.add(Config, 'numParticles', 10, 1024 * 2).step(1).onFinishChange(Settings.reload);	
			gui.add(Config, 'speed', 0, 10).onChange(Settings.refresh);
			gui.add(Config, 'waveHeight', 0, 2).onChange(Settings.refresh);
			gui.add(Config, 'numCopies', 1, 10).step(1).onFinishChange(Settings.refresh);
			// gui.add(Config, 'lightX', -1, 1).onFinishChange(Settings.reload);
			// gui.add(Config, 'lightY', -1, 1).onFinishChange(Settings.reload);
			// gui.add(Config, 'lightZ', -1, 1).onFinishChange(Settings.reload);
			// gui.add(Config, 'range', 10, 30).step(1).onFinishChange(Settings.reload);
		}, 500);

		
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = Config.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 3);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 3);

		const noiseSize = 512;
		this._fboNoise = new alfrid.FrameBuffer(noiseSize, noiseSize);

		this._fboNoise2 = new alfrid.FrameBuffer(noiseSize, noiseSize);


		const shadowMapSize = 1024;
		this._fboShadow = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		const s = 32 * 2;
		this._fboParticle = new alfrid.FrameBuffer(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vNoise = new ViewNoise();
		this._vParticles = new ViewParticles();


		const vnoise = new ViewNoise2();
		this._fboNoise2.bind();
		GL.clear(0, 0, 0, 0);
		vnoise.render();
		this._fboNoise2.unbind();
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


	updateNoise() {
		this._fboNoise.bind();
		GL.clear(1, 0, 0, 1);
		this._vNoise.render();
		this._fboNoise.unbind();
	}

	_renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);

		GL.setMatrices(this._cameraLight);
		this._vParticles.renderShadow(
			this.textureParticle,
			this._fboNoise.getTexture(),
			this._fboNoise2.getTexture()
			);

		this._fboShadow.unbind();
	}


	render() {
		this.updateNoise();

		this._renderShadowMap();

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		// GL.setMatrices(this._cameraLight);

		this._vParticles.render(
			this.textureParticle,
			this._fboNoise.getTexture(),
			this._fboNoise2.getTexture(),
			this._shadowMatrix, 
			this._fboShadow.getDepthTexture(),
			this.lightPos
		);


		// let s = .2;
		// this._bBall.draw(this.lightPos, [s, s, s], [1, 1, 1])

		// s = 200;
		// GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());

		// GL.viewport(s, 0, s, s);
		// this._bCopy.draw(this._fboNoise2.getTexture());
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get textureParticle() {
		return this._fboParticle.getTexture();
	}
}


export default SceneApp;