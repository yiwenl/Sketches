// SceneApp.js

import alfrid, { Scene, GL, Pass } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import ViewObjModel from './ViewObjModel';
import EffectComposer from './EffectComposer';
import ViewParticles from './ViewParticles';

import fsNoise from 'shaders/noise.frag';
import fsAdd from 'shaders/add.frag';
import fsRing from 'shaders/ring.frag';
import fsNormal from 'shaders/normal.frag';

const size = 512;

class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 1;
		// this.orbitalControl.rx.setTo(0.3);
		// this.orbitalControl.ry.setTo(0.3);
		this.orbitalControl.radius.setTo(8);
		this.orbitalControl.radius.value = 5;

		
		this.composer = new EffectComposer(size, size, {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
		});

		this.passNoise = new Pass(fsNoise);
		this.composer.addPass(this.passNoise);
		this.hasStarted = false;
		this.passBlur = new alfrid.PassBlur();
		this.composer.addPass(this.passBlur);


		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		const { light } = Config;
		this._cameraLight = new alfrid.CameraOrtho();
		const s = 10;
		this._cameraLight.ortho(-s, s, -s, s, 1, 50);
		this._cameraLight.lookAt(light, [0, 0, 0]);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);

		this.count = 0;
	}


	_initTextures() {
		console.log('init textures');
		console.log(alfrid.PassBlur);
		const oSettings = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
		}

		this.fbo = new alfrid.FrameBuffer(size, size, oSettings);
		this.fboCopy = new alfrid.FrameBuffer(size, size, oSettings);
		this.fboAdd = new alfrid.FrameBuffer(size, size, oSettings);

		let s = 64;
		this.fboParticle = new alfrid.FrameBuffer(s, s);
		const shader = new alfrid.GLShader(null, fsNormal);
		const sphere = alfrid.Geom.sphere(1, 48);
		s = 1;
		this.cameraOrtho.ortho(-s, s, s, -s);
		GL.setMatrices(this.cameraOrtho);
		this.fboParticle.bind();
		GL.clear(0, 0, 0, 0);
		shader.bind();
		GL.draw(sphere);
		this.fboParticle.unbind();
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		// this._vModel = new ViewObjModel();
		this._vParticles = new ViewParticles();


		this.shader = new alfrid.GLShader(null, alfrid.ShaderLibs.simpleColorFrag);
		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);

		this.mesh = alfrid.Geom.cube(1, 1, 1);

		this.shaderAdd = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsAdd);
		this.shaderRing = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsRing);
		this.meshTri = alfrid.Geom.bigTriangle();

	}

	_updateTexture() {
		this.fbo.bind();
		GL.clear(0, 0, 0, 1);
		this.shaderRing.bind();
		this.shaderRing.uniform("uRatio", "float", GL.aspectRatio);
		GL.draw(this.meshTri);

		this.fbo.unbind();
	}


	renderShadow() {
		
	}


	render() {
		this._updateTexture();
		if(!this.hasStarted) {
			this.fboCopy.bind();
			GL.clear(0, 0, 0, 1);
			this._bCopy.draw(this.fbo.getTexture());
			this.fboCopy.unbind();
			this.hasStarted = true;
		}
		GL.clear(0, 0, 0, 0);
		GL.disable(GL.DEPTH_TEST);


		this.passNoise.uniform('uTime', alfrid.Scheduler.deltaTime * 0.12);
		this.passNoise.uniform('uNoise', Config.noise);
		this.passNoise.uniform('uNoiseScale', Config.noiseScale);
		this.composer.render(this.fboCopy.getTexture());


		this.fboAdd.bind();
		GL.clear(0, 0, 0, 0);
		this.shaderAdd.bind();
		this.shaderAdd.uniform("uFade", "float", Config.fadeOutRate);
		this.shaderAdd.uniform("uSpread", "float", Config.spread);
		this.shaderAdd.uniform("texture0", "uniform1i", 0);
		this.composer.getTexture().bind(0);
		this.shaderAdd.uniform("texture1", "uniform1i", 1);
		this.fbo.getTexture().bind(1);
		GL.draw(this.meshTri);
		this.fboAdd.unbind();

		this.fboCopy.bind();
		GL.clear(0, 0, 0, 0);
		this._bCopy.draw(this.fboAdd.getTexture());
		this.fboCopy.unbind();


		GL.enable(GL.DEPTH_TEST);
		this._vParticles.render(this.composer.getTexture(), this.textureParticle);


		// let s = 0.04;
		// this._bBall.draw([0.2, 0, 0], [s, s, s], [1, 1, 1]);
		// this._bBall.draw([1.5, 0, 0], [s, s, s], [1, 1, 1]);
		// this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));
		GL.disable(GL.DEPTH_TEST);
		let s = 300;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this.composer.getTexture());
		GL.enable(GL.DEPTH_TEST);
	}


	get texture() {
		return this.fboCopy.getTexture();
	}

	get textureParticle() {
		return this.fboParticle.getTexture();
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
	}

	

	resize() {
		this.toResize(window.innerWidth, window.innerHeight);
	}
}


export default SceneApp;