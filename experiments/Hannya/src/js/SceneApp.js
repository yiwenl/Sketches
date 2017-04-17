// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewMask from './ViewMask';
import ViewPetals from './ViewPetals';
import ViewSave from './ViewSave';
import ViewSim from './ViewSim';
import ViewChar from './ViewChar';
import ViewFXAA from './ViewFXAA';
import PassBloom from './PassBloom';
import Assets from './Assets';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.radius.value = 8;
		this.orbitalControl.radius.limit(6, 10);

		//	CAMERA CUBE
		this.cameraCube = new alfrid.CameraCube();

		this._count = 0;

		this.resize();
	}

	_initTextures() {
		console.log('init textures');

		let fboSize        = 64 * 2;
		this._cubeFbo      = new alfrid.CubeFrameBuffer(fboSize);

		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		const oRender = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._fboFXAA = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bSky = new alfrid.BatchSkybox();
		this._bBall = new alfrid.BatchBall();

		this._vMask = new ViewMask();
		this._vPetals = new ViewPetals();
		this._vSim 	  = new ViewSim();
		this._vChar = new ViewChar();
		this._vFxaa = new ViewFXAA();
		this._passBloom = new PassBloom();

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

	_getCubeMap() {
		if(this._count % 6 == 0) {
			GL.setMatrices(this.cameraCube);
			for(var i=0; i<6; i++) {
				this._cubeFbo.bind(i);
				GL.clear(0, 0, 0, 0);
				this.cameraCube.face(i);
				this._renderPetals();
				this._cubeFbo.unbind();
			}
		}
		
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

		this._getCubeMap();

		//	RENDER SCENE
		this._fboRender.bind();
		GL.clear(0, 0, 0, 1);
		GL.setMatrices(this.camera);
		GL.disable(GL.DEPTH_TEST);
		this._vChar.render();
		GL.enable(GL.DEPTH_TEST);
		this._renderPetals();
		this._vMask.render(Assets.get('studio_radiance'), Assets.get('irr'), this._cubeFbo.getTexture());
		this._fboRender.unbind();

		//	FXAA
		// this._fboFXAA.bind();
		// GL.clear(0, 0, 0, 0);
		// this._vFxaa.render(this._fboRender.getTexture());
		// this._fboFXAA.unbind();

		//	BLOOM
		// this._passBloom.render(this._fboFXAA.getTexture());
		this._passBloom.render(this._fboRender.getTexture());


		//	FINAL OUTPUT
		GL.clear(0, 0, 0, 0);
		GL.disable(GL.DEPTH_TEST);
		GL.viewport(0, 0, GL.width, GL.height);
		GL.enableAdditiveBlending();
		this._bCopy.draw(this._fboRender.getTexture());
		this._bCopy.draw(this._passBloom.getTexture());

		GL.enableAlphaBlending();


		//	DEBUG

		const { fbos } = this._passBloom;
		const size = 200;

		// fbos.forEach((o, i)=> {
		// 	GL.viewport(size * i, 0, size, size / GL.aspectRatio);
		// 	this._bCopy.draw(o.fboH.getTexture());
		// });



		GL.enable(GL.DEPTH_TEST);
	}

	_renderPetals() {
		let p = this._count / params.skipCount;
		this._vPetals.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));

	}


	resize() {
		let scale = 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);

		const oRender = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
			type:GL.FLOAT
		};

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._fboFXAA = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
	}
}


export default SceneApp;