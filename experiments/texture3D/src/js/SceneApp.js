// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import View3DSlice from './View3DSlice';
import ViewCube from './ViewCube';
import Noise3DTexture from './Noise3DTexture';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		this._hasRendered = false;
		this.time = 0;
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
		this._vCube = new ViewCube();
		this._noise3D = new Noise3DTexture(8.0, 2.0);
	}


	render() {
		this.time += 0.01;
		this._noise3D.render(this.time);
		
		GL.clear(0, 0, 0, 0);
		this._bAxis.draw();
		this._bDots.draw();

		// this._vSlice.render(this._noise3D.getTexture());
		this._vCube.render(this._noise3D.getTexture());

		const size = 256;
		GL.viewport(0, 0, size, size);
		this._bCopy.draw(this._noise3D.getTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;