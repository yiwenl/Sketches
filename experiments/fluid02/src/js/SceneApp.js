// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewCubes from './ViewCubes';
import FluidSimulation from './FluidSimulation';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.9;
		this.orbitalControl.radius.value = 5;
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();

		this._vCubes = new ViewCubes();
		this._fluid = new FluidSimulation(this.camera);
	}


	render() {
		this._fluid.update();
		GL.clear(0, 0, 0, 0);

		this._vCubes.render(Assets.get('studio_radiance'), Assets.get('irr'), this._fluid.velocity, this._fluid.density);

		let s = 150;
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