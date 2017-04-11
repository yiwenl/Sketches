// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewMask from './ViewMask';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		this._vMask = new ViewMask();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		// this._bSky.draw(Assets.get('studio_radiance'));
		this._bSky.draw(Assets.get('irr'));

		this._bAxis.draw();
		this._bDots.draw();

		// this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));
		this._vMask.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('mask_ao'));
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;