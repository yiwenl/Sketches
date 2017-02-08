// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import View3DSlice from './View3DSlice';
import Noise3DTexture from './Noise3DTexture';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		this._hasRendered = false;
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vSlice = new View3DSlice();
		this._noise3D = new Noise3DTexture(16.0, 2.0);

		this._noise3D.render();
	}


	render() {
		
		GL.clear(0, 0, 0, 0);
		this._bAxis.draw();
		this._bDots.draw();

		this._vSlice.render(this._noise3D.getTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;