// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import DrawCubes from './DrawCubes';
import DrawSave from './DrawSave';
import DrawSim from './DrawSim';
import DrawCircles from './DrawCircles';
import { resize } from './utils';

import vs from 'shaders/basic.vert';
import fs from 'shaders/cubes.frag';


class SceneApp extends Scene {
	constructor() {

		super();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.setTo(6);

		this.cameraFront = new alfrid.CameraPerspective();
		this.cameraFront.setPerspective(45 * Math.PI / 180, GL.aspectRatio, 0.1, 100);
		this.cameraFront.lookAt([0, 0, 5], [0, 0, 0]);

		// this._openingOffset = new alfrid.TweenNumber(0, 'linear', 0.001);
		this._openingOffset = new alfrid.TweenNumber(0, 'expqInOut', 0.004);

		const { numParticles } = Config;
		const total = numParticles * numParticles + 10;

		// setTimeout(()=> {
			this._openingOffset.value = total;
		// }, 500);


		this.resize();
	}


	_initTextures() {
		console.log('init textures');

		this._fbo = new alfrid.FrameBuffer(GL.width, GL.height);

		const { numParticles } = Config;

		this._fboParticles = new alfrid.FboPingPong(numParticles, numParticles, {
			type:GL.FLOAT,
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
		}, 3);


		const drawSave = new DrawSave()
			.setClearColor(0, 0, 0, 1)
			.bindFrameBuffer(this._fboParticles.read)
			.draw();

		this._drawCircles = new DrawCircles();
		this._drawModel = new alfrid.Draw()
			.useProgram(vs, fs)
			.setMesh(Assets.get('model'))
			.setClearColor(0, 0, 0, 1)
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._drawCubes = new DrawCubes();
		this._drawCubes
			.setClearColor(0, 0, 0, 1);

		this._drawCircles = new DrawCircles();
		this._drawSim = new DrawSim();
	}

	update() {

		GL.enable(GL.DEPTH_TEST);
		GL.setMatrices(this.camera);


		const draw = Config.usingCubes ? this._drawCubes : this._drawModel;

		draw.bindFrameBuffer(this._fbo)
			.uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
			.draw();
		/*/
		this._drawModel
			.bindFrameBuffer(this._fbo)
			.uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
			.draw();
		//*/


		GL.setMatrices(this.cameraFront)

		this._drawSim
			.bindFrameBuffer(this._fboParticles.write)
			.uniformTexture('texturePos', this._fboParticles.read.getTexture(0), 0)
			.uniformTexture('textureVel', this._fboParticles.read.getTexture(1), 1)
			.uniformTexture('textureExtra', this._fboParticles.read.getTexture(2), 2)
			.uniformTexture('textureMap', this._fbo.texture, 3)
			.uniform('uOpeningOffset', 'float', this._openingOffset.value)
			.draw();


		this._fboParticles.swap()
	}


	render() {
		GL.clear(0, 0, 0, 0);
		GL.disable(GL.DEPTH_TEST);
		// this._bCopy.draw(this._fbo.texture);

		GL.setMatrices(this.cameraFront)
		this._drawCircles.draw(this._fboParticles.read.getTexture(0), this._fbo.texture);

	}

	resize(w, h) {
		resize(w, h);
		this.camera.setAspectRatio(GL.aspectRatio);
		this.cameraFront.setAspectRatio(GL.aspectRatio);
		this._fbo = new alfrid.FrameBuffer(GL.width, GL.height);
	}
}


export default SceneApp;