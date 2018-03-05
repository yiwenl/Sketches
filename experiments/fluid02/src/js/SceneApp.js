// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewCubes from './ViewCubes';
import ViewAO from './ViewAO';
import ViewPost from './ViewPost';
import ViewFXAA from './ViewFXAA';
import FluidSimulation from './FluidSimulation';
import Assets from './Assets';
import getMesh from './utils/getMesh';

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		this.camera.setPerspective(Math.PI/4, GL.aspectRatio, 1, 50);
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.9;
		this.orbitalControl.radius.value = 8;
		this.orbitalControl.radius.limit(6, 20);
		this.orbitalControl.rx.limit(.0, 1.5);

	}

	_initTextures() {
		
		const oPost = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
		};

		const fboScale = 0.5;
		this._fboAO 	= new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale, oPost);
		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboFXAA  = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {

		this._bCopy  = new alfrid.BatchCopy();
		
		this._vCubes = new ViewCubes();
		this._fluid  = new FluidSimulation(this.camera);
	}


	render() {
		this._fluid.update();
		GL.clear(0, 0, 0, 0);

		this._vCubes.render( this._fluid.velocity, this._fluid.density);

		const s = 200;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fluid.density);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;