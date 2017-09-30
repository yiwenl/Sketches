// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewCube from './ViewCube';
import Plane from './Plane';
import Assets from './Assets';

const center = [0, 0, 0];
const up = [0, 1, 0];
const FOV = 60 * Math.PI / 180;

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		GL.enableAlphaBlending();
		this.camera.setPerspective(FOV, GL.aspectRatio, .1, 50);
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

		this._vCube = new ViewCube();
		this._plane = new Plane([0.001, 1, 0.5], .25);
	}


	render() {
		//	update plane direction
		this._plane.update();


		//	get plane dir
		const dir = vec3.clone(this._plane.normal);
		vec3.scale(dir, dir, 5.5);


		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		this._bAxis.draw();
		this._bDots.draw();

		this._vCube.render(this._plane.plane);
		this._plane.render(this._plane.plane, this._vCube.dimension);
	}

	resize() {
		let { innerWidth, innerHeight, devicePixelRatio } = window;
		devicePixelRatio = 1;
		GL.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
		this.camera.setAspectRatio(GL.aspectRatio);

		console.log('Resize canvas :', GL.width, GL.height);
	}
}


export default SceneApp;