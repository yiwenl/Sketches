// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
// import ViewPlanes from './ViewPlanes';
import ViewTest from './ViewTest';
import Simulation from './Simulation';

import fsInner from 'shaders/sim.frag';
import fsOuter from 'shaders/simOuter.frag';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this._countOuter = 1;
		const RAD = Math.PI/180;
		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 14;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.5;
	}

	_initTextures() {
		console.log('init textures');

	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
		this._vTest = new ViewTest(params.inner.numParticles);
		this._vTestOuter = new ViewTest(params.outer.numParticles);

		this._innerSphere = new Simulation(this, fsInner, params.inner.numParticles, false);
		this._outerSphere = new Simulation(this, fsOuter, params.outer.numParticles, true);

	}


	render() {

		this._count ++;
		this._countOuter++
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this._innerSphere.update();
		}

		if(this._countOuter % params.skipCount == 0) {
			this._countOuter = 0;
			this._outerSphere.update();
		}

		GL.clear(0, 0, 0, 0);

		this._bDots.draw();
		const s = 2;
		this._bBall.draw([0, 0, 0], [s, s, s], [1, 1, 1]);

		let p = this._count / params.skipCount;
		this._vTest.render(this._innerSphere.current, this._innerSphere.next, p, this._innerSphere.extras, true);

		p = this._countOuter / params.skipCount;
		this._vTestOuter.render(this._outerSphere.current, this._outerSphere.next, p, this._outerSphere.extras);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;