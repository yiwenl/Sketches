// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/3, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 25;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;


		//	camera shadow
		this._cameraLight = new alfrid.CameraOrtho();
		const size = 10;
		this._cameraLight.ortho(-size, size, size, -size, 2, 50);
		this._cameraLight.lookAt(params.light, [0, 0, 0]);
		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);


		this._identityMatrix = mat4.create();
		this._modelMatrix = mat4.create();
		mat4.rotateY(this._modelMatrix, this._modelMatrix, .1);
		mat4.rotateX(this._modelMatrix, this._modelMatrix, .1);
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

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);

		this._fboDepth = new alfrid.FrameBuffer(1024, 1024, {type:GL.FLOAT, minFilter:GL.NEAREST, magFilter:GL.NEAREST});
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
		this._vFloor  = new ViewFloor();

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
		this._vSim.render(
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(2),
			this._fboCurrent.getTexture(3)
			);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;
	}


	render() {

		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;


		this.renderShadowMap();


		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		const s = .1;
		this._bBall.draw(params.light, [s, s, s], [1, 0, 0]);

		
		GL.rotate(this._identityMatrix);
		this._vFloor.render(this._shadowMatrix, this._fboDepth.getDepthTexture());
		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), this._shadowMatrix, this._fboDepth.getDepthTexture());
		GL.rotate(this._modelMatrix);
		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), this._shadowMatrix, this._fboDepth.getDepthTexture());

		const size = 256;

		// for(let i=0; i<4; i++) {
		// 	GL.viewport(0, size * i, size, size);
		// 	this._bCopy.draw(this._fboCurrent.getTexture(i));
		// }

		GL.viewport(0, 0, size, size);
		this._bCopy.draw(this._fboDepth.getDepthTexture());
	}

	renderShadowMap() {
		this._fboDepth.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);

		let p = this._count / params.skipCount;
		GL.rotate(this._identityMatrix);
		this._vRender.renderShadow(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), this._shadowMatrix);
		GL.rotate(this._modelMatrix);
		this._vRender.renderShadow(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), this._shadowMatrix);
		this._fboDepth.unbind();
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;