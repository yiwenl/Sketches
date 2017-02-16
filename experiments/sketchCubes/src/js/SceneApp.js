// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import ViewBall from './ViewBall';
import ViewCubes from './ViewCubes';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
		this.orbitalControl.radius.limit(3, 10);
		this.orbitalControl.rx.limit(0, Math.PI/2 - .2);

		this._modelMatrix = mat4.create();
		mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, -2, 0));

		this._isMouseDown = false;
		window.addEventListener('mousedown', (e)=>this._onDown(e));
		window.addEventListener('mouseup', (e)=>this._onUp(e));
		window.addEventListener('mousemove', (e)=>this._onMove(e));
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bSky = new alfrid.BatchSkybox();

		this._vBall = new ViewBall();
		this._vCubes = new ViewCubes();
	}


	_onDown(e) {
		this._isMouseDown = true;
	}

	_onMove(e) {

	}

	_onUp(e) {
		this._isMouseDown = false;
	}


	render() {
		params.time += 0.01;
		const grey = .5;
		GL.clear(grey, grey, grey, 1.0);

		// this._bSky.draw(Assets.get('studio_radiance'));
		GL.enableAdditiveBlending();
		this._bSky.draw(Assets.get('irr'));
		GL.enableAlphaBlending();


		GL.rotate(this._modelMatrix);

		this._vBall.render(Assets.get('studio_radiance'), Assets.get('irr'));
		this._vCubes.render(Assets.get('studio_radiance'), Assets.get('irr'));

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;