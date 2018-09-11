// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import FluidSimulation from './FluidSimulation';
import ViewFloor from './ViewFloor';
import ViewNoise2 from './ViewNoise2';
import ViewParticles from './ViewParticles';
import fs from 'shaders/normal.frag';

let s = 0.04;
const ballSize = [s, s, s];
const ballColour = [1, 1, 1];

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		const r = 0.5;
		const y = 0.25;
		this._point0 = vec3.fromValues(r, y, 0);
		this._point1 = vec3.fromValues(-r, y, 0);

		const rotSpeed = Config.rotationSpeed;
		this._mtxRot = mat4.create();
		mat4.rotateY(this._mtxRot, this._mtxRot, rotSpeed);


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
			gui.add(Config, 'DENSITY_DISSIPATION', 0.95, 1.0).onChange(Settings.refresh);
			gui.add(Config, 'VELOCITY_DISSIPATION', 0.95, 1.0).onChange(Settings.refresh);
			gui.add(Config, 'PRESSURE_DISSIPATION', 0.95, 1.0).onFinishChange(Settings.reload);
			gui.add(Config, 'rotationSpeed', 0.02, 0.2).onFinishChange(Settings.reload);
		}, 500);
	}

	_initTextures() {
		console.log('init textures');

		const noiseSize = 512;
		this._fboNoise2 = new alfrid.FrameBuffer(noiseSize, noiseSize, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});

		const shadowMapSize = 1024;
		this._fboShadow = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		const s = 32 * 2;
		this._fboParticle = new alfrid.FrameBuffer(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._bBall = new alfrid.BatchBall();

		this._vFloor = new ViewFloor();

		this._fluid  = new FluidSimulation(this.camera);
		this._vParticles = new ViewParticles();


		const vnoise = new ViewNoise2();
		this._fboNoise2.bind();
		GL.clear(0, 0, 0, 0);
		vnoise.render();
		this._fboNoise2.unbind();
	}


	renderShadow() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);

		GL.setMatrices(this._cameraLight);
		this._vParticles.renderShadow(
			this.textureParticle,
			this._fluid.density,
			this._fboNoise2.getTexture()
			);

		this._fboShadow.unbind();
	}


	render() {
		vec3.transformMat4(this._point0, this._point0, this._mtxRot);
		vec3.transformMat4(this._point1, this._point1, this._mtxRot);

		this._fluid.update();
		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();


		// this._vFloor.render(this._fluid.density);

		// this._bBall.draw(this._point0, ballSize, ballColour);
		// this._bBall.draw(this._point1, ballSize, ballColour);

		this._vParticles.render(
			this.textureParticle,
			this._fluid.density,
			this._fboNoise2.getTexture(),
			this._shadowMatrix, 
			this._fboShadow.getDepthTexture(),
			this.lightPos
		);


		let s = 300;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fluid.density);
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