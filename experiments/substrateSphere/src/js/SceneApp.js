// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel'
import ViewSphere from './ViewSphere';
import ViewBalls from './ViewBalls';
import Assets from './Assets';
import MarchingLine from './MarchingLine';

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		this._line = new MarchingLine();

		this._lines = [];
		const num = 5;
		for(let i=0; i<num; i++) {
			const line = new MarchingLine();

			line.on('onHit', (e)=>this._onHit(e.detail));
			this._lines.push(line);
		}
	}


	_onHit(o) {

		this._lines = this._lines.concat(o.lines);
		o.lines.forEach( line => {
			line.on('onHit', (e)=>this._onHit(e.detail));
		});
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

		this._vBalls = new ViewBalls();
		this._vSphere = new ViewSphere();

		// this._vModel = new ViewObjModel();
	}



	render() {
		GL.clear(0, 0, 0, 0);

		const _s = .005;
		const s = [_s, _s, _s];

		// this._line.march();
		// this._line.points.forEach( p => {
		// 	this._bBall.draw(p, s, [1, 1, 1]);
		// });

		let allPoints = [];
		this._lines.forEach(l => {
			allPoints = allPoints.concat(l.points);
		});

		let count = 0;
		const balls = [];
		this._lines.forEach(line => {
			line.march(allPoints);
			line.points.forEach( p => {
				// this._bBall.draw(p, s, [1, 1, 1]);	
				// count ++;

				balls.push(p);

			});
		});


		this._vBalls.render(balls, Assets.get('studio_radiance'), Assets.get('irr'));
		this._vSphere.render(Assets.get('studio_radiance'), Assets.get('irr'));
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;