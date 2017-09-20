// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewRing from './ViewRing';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.radius.value = .05;
		// this.orbitalControl.lockZoom(true);

		this.modelMatrix = mat4.create();
		mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(0, -1.8, 0));

		this.modelMatrixMask = mat4.create();
		mat4.translate(this.modelMatrixMask, this.modelMatrixMask, vec3.fromValues(0, -.5, -2.6));		
		//	create camera
	}

	_initTextures() {
		console.log('init textures');

		//	create projection texture
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vRing = new ViewRing();
		this._vModel = new ViewObjModel();

		//	get shadowmap
		this._createShadowMap();
	}


	_createShadowMap() {

	}


	render() {
		// this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);

		GL.rotate(this.modelMatrix);

		// this._bSky.draw(Assets.get('studio_radiance'));
		// this._bSky.draw(Assets.get('irr'));

		this._bAxis.draw();
		this._bDots.draw();

		// this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));

		this._vRing.render();

		GL.rotate(this.modelMatrixMask);
		this._vModel.render();
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;