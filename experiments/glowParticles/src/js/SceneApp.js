// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import ViewPillar from './ViewPillar';
import ViewPost from './ViewPost';
import PassBloom from './PassBloom';
import fs from 'shaders/normal.frag';
import Config from './Config';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();


		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10;
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = -0.1;
	}

	_initTextures() {
		this.resize();
		console.log('init textures');

		//	FBOS
		const numParticles = Config.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 4);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 4);

		const fboScale = 2;
		this._fboRender = new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale, {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR
		});
		this._fboPost = new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		// this._vFloor = new ViewFloor();
		this._vPillar = new ViewPillar();
		this._vPost = new ViewPost()

		this._passBloom = new PassBloom();


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

	_renderParticles() {
		let p = this._count / Config.skipCount;
		this._vRender.render(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p, 
			this._fboCurrent.getTexture(2)
		);
	}


	render() {

		this._count ++;
		if(this._count % Config.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vPillar.render();
		this._renderParticles();
		this._fboRender.unbind();

		this._passBloom.render(this._fboRender.getTexture());

		this._fboPost.bind();
		GL.clear(0, 0, 0, 1);
		this._vPillar.render();
		this._renderParticles();
		this._fboPost.unbind();

		GL.disable(GL.DEPTH_TEST);
		this._vPost.render(this._fboPost.getTexture());

		GL.enableAdditiveBlending();
		this._bCopy.draw(this._passBloom.getTexture());
		GL.enableAlphaBlending();
		GL.enable(GL.DEPTH_TEST);

		const s = 256;
		GL.viewport(0, 0, s, s/GL.aspectRatio);
		// this._bCopy.draw(this._passBloom.getTexture());
		// this._bCopy.draw(this._fboShadow.getDepthTexture());

		// GL.viewport(s, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());
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