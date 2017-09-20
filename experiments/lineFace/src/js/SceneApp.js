// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewRing from './ViewRing';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';

const RAD = Math.PI / 180;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.radius.value = .05;
		// this.orbitalControl.lockZoom(true);



		//	model matrix
		this.modelMatrix = mat4.create();
		mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(0, -1.8, 0));

		this.modelMatrixMask = mat4.create();
		mat4.translate(this.modelMatrixMask, this.modelMatrixMask, vec3.fromValues(0, -.5, -2.6));		

		//	create camera
		this._shadowMatrix = mat4.create();
		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		this.pointSource = vec3.fromValues(0, 1, 5);
		const fov = 60 * RAD;
		this._cameraLight = new alfrid.CameraPerspective();
		this._cameraLight.setPerspective(fov, 1, 1, 50);
		this._cameraLight.lookAt(this.pointSource, [0, 0, 0]);

		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);

		
	}

	_initTextures() {
		//	create projection texture
		this.fboModel = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.NEAREST, magFilter:GL.NEAREST, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

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

		const s = .1;
		this._bBall.draw(this.pointSource, [s, s, s], [1, 1, 1]);

		GL.rotate(this.modelMatrixMask);
		this._vModel.render();
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;