// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
// import ViewPlanes from './ViewPlanes';
import ViewTest from './ViewTest';
import ViewBall from './ViewBall';
import Simulation from './Simulation';

import fsInner from 'shaders/sim.frag';
import fsOuter from 'shaders/simOuter.frag';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this._countOuter = 1;
		const RAD = Math.PI/180;
		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 14;
		this.orbitalControl.radius.limit(10, 20);
		this.orbitalControl.center[1] = 1;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.35;
		this.orbitalControl.rx.limit(0.2, 1.0);

		this.mtxIdentity = mat4.create();
		this.mtxOuter1 = mat4.create();
		this.mtxOuter2 = mat4.create();
		this.mtxInner1 = mat4.create();
		this.mtxInner2 = mat4.create();
		this.rotationOuter1 = Math.random() * 0xFF;
		this.rotationOuter2 = Math.random() * 0xFF;
		this.rotationInner1 = Math.random() * 0xFF;
		this.rotationInner2 = Math.random() * 0xFF;

		this.axis1 = vec3.fromValues(random(2, 1), random(-1, 1), random(-1, 1));
		this.axis2 = vec3.fromValues(random(2, 1), random(-1, 1), random(-1, 1));
		vec3.normalize(this.axis1, this.axis1);
		vec3.normalize(this.axis2, this.axis2);
		this.quat1 = quat.create();
		this.quat2 = quat.create();

	}

	_initTextures() {
		console.log('init textures');

	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		
		this._vBall = new ViewBall();


		//	views
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
		this._vTest = new ViewTest(params.inner.numParticles);
		this._vTestOuter = new ViewTest(params.outer.numParticles);
		this._bDots = new alfrid.BatchDotsPlane();

		this._innerSphere = new Simulation(this, fsInner, params.inner.numParticles/2, false);
		this._outerSphere = new Simulation(this, fsOuter, params.outer.numParticles, true);

	}


	render() {

		this.rotationOuter1 -= 0.0001;
		this.rotationOuter2 -= 0.0002;
		this.rotationInner1 -= 0.0001;
		this.rotationInner2 -= 0.0002;
		mat4.rotateY(this.mtxOuter1, this.mtxIdentity, this.rotationOuter1);
		mat4.rotateY(this.mtxOuter2, this.mtxIdentity, this.rotationOuter2);
		// mat4.rotateY(this.mtxInner2, this.mtxIdentity, this.rotationInner2);
		quat.setAxisAngle(this.quat1, this.axis1, this.rotationInner2);
		mat4.fromQuat(this.mtxInner1, this.quat1);
		quat.setAxisAngle(this.quat2, this.axis2, this.rotationInner2);
		mat4.fromQuat(this.mtxInner2, this.quat2);

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

		// this._bDots.draw();
		// this._vBall.render();
		// const s = 2;
		// this._bBall.draw([0, 0, 0], [s, s, s], [1, 1, 1]);
		GL.rotate(this.mtxIdentity);
		let p = this._count / params.skipCount;
		this._vTest.render(this._innerSphere.current, this._innerSphere.next, p, this._innerSphere.extras, true);

		p = this._countOuter / params.skipCount;
		this._vTestOuter.render(this._outerSphere.current, this._outerSphere.next, p, this._outerSphere.extras, false, 1.5);

		GL.rotate(this.mtxInner1);
		this._vTest.render(this._innerSphere.current, this._innerSphere.next, p, this._innerSphere.extras, true);
		GL.rotate(this.mtxInner2);
		this._vTest.render(this._innerSphere.current, this._innerSphere.next, p, this._innerSphere.extras, true);

		GL.rotate(this.mtxOuter1);
		this._vTestOuter.render(this._outerSphere.current, this._outerSphere.next, p, this._outerSphere.extras, false, 1.5);
		GL.rotate(this.mtxOuter2);
		this._vTestOuter.render(this._outerSphere.current, this._outerSphere.next, p, this._outerSphere.extras, false, 1.5);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;