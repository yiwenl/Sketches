// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewOutline from './ViewOutline';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		const s = 0.4;
		this._modelMatrix = mat4.create();
		mat4.scale(this._modelMatrix, this._modelMatrix, vec3.fromValues(s, s, s));
		mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, -2.5, 0));
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		// this._bSky = new alfrid.BatchSkybox();

		this._vModel = new ViewObjModel();
		this._vOutline = new ViewOutline();
	}


	render() {
		const g = 0.95;
		GL.clear(g, g, g, 1);
		GL.rotate(this._modelMatrix);

		this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aoGiant'));
		// this._vOutline.render();
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;