// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import FboPingPong from './FboPingPong';
import FluidSimulation from './FluidSimulation';
import ViewPlane from './ViewPlane';
import ViewLines from './ViewLines';

import ViewSim from './ViewSim';
import ViewParticles from './ViewParticles';
import Assets from './Assets';
import getMesh from './utils/getMesh';
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


		// gui.add(params, 'height', 1, 5);
		// gui.add(params, 'cap', 0, 5);
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

		this._vSim = new ViewSim();
		this._vParticles = new ViewParticles();

		this._fluid  = new FluidSimulation(this.camera);

		// this._vPlane = new ViewPlane();
		// this._passNormal = new PassNormal();
		// this._vLines = new ViewLines();
		// this._passBloom = new PassBloom(3);
	}


	render() {

		//	update fluid
		this._fluid.update();

		this._fboPos.write.bind();
		GL.clear(0, 0, 0, 0);
		this._vSim.render(this._fboPos.read.getTexture(0), this._fluid.velocity, this._fboPos.read.getTexture(1));
		this._fboPos.write.unbind();
		this._fboPos.swap();

		GL.clear(0, 0, 0, 0);

		//	update normal 
		// this._fboNormal.bind();
		// GL.clear(0, 0, 0, 0);
		// this._passNormal.render(this._fluid.density);
		// this._fboNormal.unbind();


		//	first render
		// this._fboRender.bind();
		// GL.clear(0, 0, 0, 0);

		// if(((params.type+1) & 2) > 0) {
		// 	this._vLines.render(this._fluid.density, this._fboNormal.getTexture(), Assets.get('studio_radiance'), Assets.get('irr'));	
		// } 

		// if(((params.type+1) & 1) > 0) {
		// 	this._vPlane.render(this._fluid.density, this._fboNormal.getTexture(), Assets.get('studio_radiance'), Assets.get('irr'));
		// }

		// this._fboRender.unbind();

		// this._passBloom.render(this._fboRender.getTexture());

		this._vParticles.render(
			this._fboPos.readTexture, 
			this._fluid.density
			);


		let s = 300;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fluid.density);
		GL.viewport(s, 0, s, s);
		this._bCopy.draw(this._fluid.velocity);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;