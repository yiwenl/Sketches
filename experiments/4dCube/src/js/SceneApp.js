// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import View4DCube from './View4DCube';
import AnimateCube from './AnimateCube';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
	}

	_initTextures() {
	}

	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vCube = new AnimateCube();


		gui.add(this._vCube, 'randomTo');
	}


	render() {
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		this._bDots.draw();

		this._vCube.render();
	}

	resize() {
		let { innerWidth, innerHeight, devicePixelRatio } = window;
		if(!GL.isMobile) {
			devicePixelRatio = 1;	
		}
		
		GL.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;