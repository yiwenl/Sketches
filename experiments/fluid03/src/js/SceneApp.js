// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import ViewCubes from './ViewCubes';
import ViewParticles from './ViewParticles';
import ViewSim from './ViewAdd';
import FboPingPong from './FboPingPong';
import FluidSimulation from './FluidSimulation';
import Assets from './Assets';
import getMesh from './utils/getMesh';
// import savePos from './utils/savePos';
import Config from './Config';

import fs from 'shaders/save.frag';

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		this.camera.setPerspective(Math.PI/4, GL.aspectRatio, 1, 50);
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.8;
		this.orbitalControl.rx.value  = 0.8;
		// this.orbitalControl.ry.value = Math.PI;
		this.orbitalControl.radius.value = 15;
		this.orbitalControl.radius.limit(10, 25);
		this.orbitalControl.rx.limit(0.1, Math.PI / 2-0.1);
	}

	_initTextures() {

		const num = Config.NUM_PARTICLES;
		this._fboPos = new FboPingPong(num, num, {minFilter:GL.NEAREST, magFilter:GL.NEAREST, type:GL.FLOAT}, 2);

		const mesh = getMesh();
		const shader = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fs);
		const seed = Math.random() * 0xFF;

		const savePos = (fbo) => {
			fbo.bind();
			GL.clear(1, 0, 0, 1);
			shader.bind();
			shader.uniform("uSize", "float", Config.PLANE_SIZE);
			shader.uniform("uSeed", "float", seed);
			GL.draw(mesh);
			fbo.unbind();
		}

		savePos(this._fboPos.read);
		savePos(this._fboPos.write);

	}


	_initViews() {

		this._bCopy  = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		
		this._vCubes = new ViewCubes();
		this._vSim = new ViewSim();
		this._fluid  = new FluidSimulation(this.camera);

		this._vParticles = new ViewParticles();
	}


	render() {
		this._fluid.update();
		GL.clear(0, 0, 0, 0);

		this._fboPos.write.bind();
		GL.clear(0, 0, 0, 0);
		this._vSim.render(this._fboPos.read.getTexture(0), this._fluid.velocity, this._fboPos.read.getTexture(1));
		this._fboPos.write.unbind();
		this._fboPos.swap();

		this._vParticles.render(this._fboPos.readTexture, this._fboPos.writeTexture, this._fluid.density);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;