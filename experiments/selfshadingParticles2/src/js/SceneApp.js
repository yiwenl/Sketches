// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewPlane from './ViewPlane';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 15;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;


		//	light

		this.lightPosition = [.5, 10, 0];
		this.cameraLight = new alfrid.CameraOrtho();
		const size = 10;
		this.cameraLight.ortho(-size, size, size, -size, 1, 50);
		this.cameraLight.lookAt(this.lightPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		this.shadowMatrix = mat4.create();
		mat4.multiply(this.shadowMatrix, this.cameraLight.projection, this.cameraLight.viewMatrix);
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);

		const shadowSize = 1024;
		this._fboShadow = new alfrid.FrameBuffer(shadowSize, shadowSize);
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
		this._vPlane  = new ViewPlane();

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
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2));
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

		//	DRAW SHADOW MAP
		this._fboShadow.bind();
		GL.clear(1, 1, 1, 1);
		GL.gl.depthFunc(GL.gl.LEQUAL);
		GL.setMatrices(this.cameraLight);
		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));
		this._fboShadow.unbind();


		GL.setMatrices(this.camera);
		GL.clear(0, 0, 0, 0);
		// this._bBall.draw(this.lightPosition, [1, 1, 1], [1, .8, .5]);
		this._vPlane.render(this.shadowMatrix, this._fboShadow.getDepthTexture());

		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), this.shadowMatrix, this._fboShadow.getDepthTexture());

		// const size = Math.min(params.numParticles, GL.height/2);
		// GL.viewport(0, 0, size, size);
		// this._bCopy.draw(this._fboShadow.getTexture());
		// GL.viewport(0, size, size, size);
		// this._bCopy.draw(this._fboShadow.getDepthTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;