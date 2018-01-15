// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import ViewModel from './ViewModel';
import ViewBox from './ViewBox';
import ViewBall from './ViewBall';
import HitDetector from './HitDetector';
import fs from 'shaders/normal.frag';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 8;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		this._cameraLight = new alfrid.CameraOrtho();
		let s = 10;
		this._cameraLight.ortho(-s, s, -s, s, 1, 50);
		// this._cameraLight.lookAt([0, 10, 0.1], [0, 0, 0], [0, 1, 0]);
		// this._cameraLight.lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1]);
		this._cameraLight.lookAt(params.lightPos, [0, 0, 0]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);

		//	get particle normal map
		const size = 1;
		this.cameraOrtho.ortho(-size, size, -size, size);
		this.cameraOrtho.lookAt([0, 0, 3], [0, 0, 0]);
		const mesh = alfrid.Geom.sphere(1, 12);
		const shader = new alfrid.GLShader(null, fs);
		this._fboParticle.bind();
		// GL.clear(1, 0, 0, 1);
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraOrtho);
		shader.bind();
		GL.draw(mesh);
		this._fboParticle.unbind();

		//	model matrix
		this._modelMatrix = mat4.create();
		mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, -6, 0));

		//	
		const y = 0;
		this.pointSource0 = vec3.fromValues(0, y, 7);
		this.pointSource1 = vec3.fromValues(0, y, -7);
		s = 8;
		this._cameraLight0 = new alfrid.CameraOrtho();
		this._cameraLight0.ortho(-s, s, -s, s, 1, 50);
		this._cameraLight0.lookAt(this.pointSource0, [0, y, 0]);

		this._cameraLight1 = new alfrid.CameraOrtho();
		this._cameraLight1.ortho(-s, s, -s, s, 1, 50);
		this._cameraLight1.lookAt(this.pointSource1, [0, y, 0]);


		this._shadowMatrix0 = mat4.create();
		this._shadowMatrix1 = mat4.create();
		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		mat4.multiply(this._shadowMatrix0, this._cameraLight0.projection, this._cameraLight0.viewMatrix);
		mat4.multiply(this._shadowMatrix0, this._biasMatrix, this._shadowMatrix0);

		mat4.multiply(this._shadowMatrix1, this._cameraLight1.projection, this._cameraLight1.viewMatrix);
		mat4.multiply(this._shadowMatrix1, this._biasMatrix, this._shadowMatrix1);

		this._capture();

		this._detector = new HitDetector(this.camera, this._modelMatrix);
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		//	1 : position
		// 	2 : velocity
		// 	3 : extras
		//	4 : org position
		// 	5 : {hasSet, random, random}

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 5);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 5);

		this._fboShadow = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		const s = 32 * 2;
		this._fboParticle = new alfrid.FrameBuffer(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});

		const size = 512;

		this.fboModel0 = new alfrid.FrameBuffer(size, size, {type:GL.FLOAT, minFilter:GL.NEAREST, magFilter:GL.NEAREST, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
		this.fboModel1 = new alfrid.FrameBuffer(size, size, {type:GL.FLOAT, minFilter:GL.NEAREST, magFilter:GL.NEAREST, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._vFloor = new ViewFloor();
		this._vModel = new ViewModel();
		this._vBox = new ViewBox();
		this._vBall = new ViewBall();


		//	views
		this._vRender = new ViewRender();
		this._vRenderShadow = new ViewRenderShadow();
		this._vSim 	  = new ViewSim();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);


		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboCurrent.unbind();

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboTarget.unbind();

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		GL.rotate(this._modelMatrix);
		this._vSim.render(
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(2),
			this._fboCurrent.getTexture(3),
			this._fboCurrent.getTexture(4),
			this.fboModel0.getTexture(),
			this.fboModel1.getTexture(),
			this._shadowMatrix0,
			this._shadowMatrix1,
			this._detector.hit
		);

		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

	}

	_capture() {
		this.fboModel0.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight0);
		GL.rotate(this._modelMatrix);
		this._vModel.renderPosition();
		this.fboModel0.unbind();

		this.fboModel1.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight1);
		GL.rotate(this._modelMatrix);
		this._vModel.renderPosition();
		this.fboModel1.unbind();

	}

	_renderParticles() {
		let p = this._count / params.skipCount;
		this._vRender.render(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p, 
			this._fboCurrent.getTexture(2),
			this._shadowMatrix, 
			this._fboShadow.getDepthTexture(),
			this._fboCurrent.getTexture(4)
		);
	}

	_renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);
		GL.rotate(this._modelMatrix);
		let p = this._count / params.skipCount;
		// this._vRenderShadow.render(
		// 	this._fboTarget.getTexture(0), 
		// 	this._fboCurrent.getTexture(0), 
		// 	p, 
		// 	this._fboCurrent.getTexture(2)
		// );
		this._vModel.render(this._detector.hit);
		this._vBall.render(
			this._detector.hit,
			this.fboModel0.getTexture(),
			this.fboModel1.getTexture(),
			this._shadowMatrix0,
			this._shadowMatrix1,
		);
		this._fboShadow.unbind();
	}


	render() {

		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		this._renderShadowMap();

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		GL.rotate(this._modelMatrix);

		this._renderParticles();
		this._vFloor.render(this._shadowMatrix, this._fboShadow.getDepthTexture());
		this._vModel.render(this._detector.hit);
		this._vBall.render(
			this._detector.hit,
			this.fboModel0.getTexture(),
			this.fboModel1.getTexture(),
			this._shadowMatrix0,
			this._shadowMatrix1,
		);
		this._detector.debug();

		// this._vBox.render();

		// const s = 32;
		// GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this._fboParticle.getTexture());
		// this._bCopy.draw(this._fboShadow.getDepthTexture());

		// GL.viewport(s, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());


		/*/
		let s = 100;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this.fboModel0.getTexture());

		GL.viewport(s, 0, s, s);
		this._bCopy.draw(this.fboModel1.getTexture());

		for(let i=0; i<5; i++) {
			GL.viewport(s * (i + 2), 0, s, s);
			this._bCopy.draw(this._fboCurrent.getTexture(i));
		}
		//*/
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get textureParticle() {
		return this._fboParticle.getTexture();
	}
}


export default SceneApp;