// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewButterFlies from './ViewButterFlies';
import ViewFloor from './ViewFloor';
import EffectComposer from './effectComposer/EffectComposer';
import PassBlur from './PassBlur';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		GL.disable(GL.CULL_FACE);

		this._count = 0;
		this.camera.setPerspective(Math.PI/3, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.lockZoom(true);
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.isMobile ? GL.HALF_FLOAT : GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);

		this._fboRender 	= new alfrid.FrameBuffer(GL.width, GL.height);
		const blurSize		= 1024;
		this._composerBlur 	= new EffectComposer(blurSize, blurSize);

		this._passVBlur 		= new PassBlur();
		this._passHBlur 		= new PassBlur();
		
		this._passVBlur.addTexture('textureDepth', this._fboRender.getDepthTexture());
		this._passVBlur.uniform('uDirection', 'vec2', [0, 1]);
		this._passVBlur.uniform('uResolution', 'vec2', [GL.width, GL.height]);

		this._passHBlur.addTexture('textureDepth', this._fboRender.getDepthTexture());
		this._passHBlur.uniform('uDirection', 'vec2', [1, 0]);
		this._passHBlur.uniform('uResolution', 'vec2', [GL.width, GL.height]);

		this._composerBlur.addPass(this._passVBlur);
		this._composerBlur.addPass(this._passHBlur);

	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
		this._vButterfly = new ViewButterFlies();
		this._vFloor = new ViewFloor();

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

		GL.clear(0, 0, 0, 0);


		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vFloor.render();
		this._vButterfly.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p);
		this._fboRender.unbind();

		this._passHBlur.uniform('uFocus', 'float', params.focus);
		this._passVBlur.uniform('uFocus', 'float', params.focus);

		this._composerBlur.render(this._fboRender.getTexture());
		this._bCopy.draw(this._composerBlur.getTexture());


		const size = 256;
		GL.viewport(0, 0, size * GL.aspectRatio, size);
		this._bCopy.draw(this._fboRender.getTexture());
		GL.viewport(0, size, size * GL.aspectRatio, size);
		this._bCopy.draw(this._fboRender.getDepthTexture());


		/*
		const size = Math.min(params.numParticles, GL.height/4);

		for(let i=0; i<4; i++) {
			GL.viewport(0, size * i, size, size);
			this._bCopy.draw(this._fboCurrent.getTexture(i));
		}
		*/

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;