// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewRing from './ViewRing';
import ViewObjModel from './ViewObjModel';
import ViewCubes from './ViewCubes';
import Assets from './Assets';

const RAD = Math.PI / 180;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.radius.value = 7.05;
		this.orbitalControl.lockZoom(true);



		//	model matrix
		this.modelMatrix = mat4.create();
		// mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(0, -1.8, 0));

		// this.modelMatrixMask = mat4.create();
		// mat4.translate(this.modelMatrixMask, this.modelMatrixMask, vec3.fromValues(0, -.5, -2.6));		

		//	create camera
		this._shadowMatrix0 = mat4.create();
		this._shadowMatrix1 = mat4.create();
		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		this.pointSource0 = vec3.fromValues(0, 0, 5);
		this.pointSource1 = vec3.fromValues(0, 0, -5);
		const fov = 45 * RAD;
		this._cameraLight0 = new alfrid.CameraPerspective();
		this._cameraLight0.setPerspective(fov, 1, 1, 50);
		this._cameraLight0.lookAt(this.pointSource0, [0, 0, 0]);

		this._cameraLight1 = new alfrid.CameraPerspective();
		this._cameraLight1.setPerspective(fov, 1, 1, 50);
		this._cameraLight1.lookAt(this.pointSource1, [0, 0, 0]);

		mat4.multiply(this._shadowMatrix0, this._cameraLight0.projection, this._cameraLight0.viewMatrix);
		mat4.multiply(this._shadowMatrix0, this._biasMatrix, this._shadowMatrix0);

		mat4.multiply(this._shadowMatrix1, this._cameraLight1.projection, this._cameraLight1.viewMatrix);
		mat4.multiply(this._shadowMatrix1, this._biasMatrix, this._shadowMatrix1);
	}


	_initTextures() {
		//	create projection texture
		this.fboModel0 = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.NEAREST, magFilter:GL.NEAREST, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
		this.fboModel1 = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.NEAREST, magFilter:GL.NEAREST, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vRing = new ViewRing();
		this._vModel = new ViewObjModel();
		this._vCubes = new ViewCubes();
	}


	_createShadowMap() {
		this.fboModel0.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight0);
		this._vModel.render();
		this.fboModel0.unbind();

		this.fboModel1.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight1);
		this._vModel.render();
		this.fboModel1.unbind();
	}


	render() {

		this._createShadowMap();


		// this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		GL.rotate(this.modelMatrix);

		this._bAxis.draw();
		this._bDots.draw();

		// this._vRing.render();
		this._vCubes.render(this.depthTexture0, this._shadowMatrix0, this.depthTexture1, this._shadowMatrix1);
		// this._vModel.render();

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get depthTexture0() { return this.fboModel0.getDepthTexture(); }
	get depthTexture1() { return this.fboModel1.getDepthTexture(); }
}


export default SceneApp;