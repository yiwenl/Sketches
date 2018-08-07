// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import ViewWires from './ViewWires';
import ViewBoxes from './ViewBoxes';
import ViewRoom from './ViewRoom';
import DragControl from './DragControl';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.camera.setPerspective(65 * Math.PI / 180, GL.aspectRatio, 0.1, 100);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
		this.orbitalControl.lockZoom(true);

		let d = 2;
		let r = 2;
		this._control0 = vec3.fromValues(-d, random(-r, r), random(-r, r));
		this._control1 = vec3.fromValues( d, random(-r, r), random(-r, r));

		const meshBall = alfrid.Geom.sphere(Config.ballSize, 24);
		this._dragControl0 = new DragControl(meshBall, this._control0, this.camera, this.orbitalControl);
		this._dragControl0.on('onHit', (e)=> {
			vec3.copy(this._control0, e.detail);
		});

		this._dragControl1 = new DragControl(meshBall, this._control1, this.camera, this.orbitalControl);
		this._dragControl1.on('onHit', (e)=> {
			vec3.copy(this._control1, e.detail);
		});
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		// this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vWires = new ViewWires();
		this._vBoxes = new ViewBoxes(this._vWires.points);
		this._vRoom = new ViewRoom();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._vRoom.render();
		this._vWires.render(this._control0, this._control1);
		

		let s = Config.ballSize;
		// this._bBall.draw(this._control0, [s, s, s], [145/255, 170/255, 157/255]);
		this._bBall.draw(this._control0, [s, s, s], [252/255, 255/255, 245/255]);
		this._bBall.draw(this._control1, [s, s, s], [62/255, 96/255, 111/255]);


		this._vBoxes.render(this._control0, this._control1);

	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;