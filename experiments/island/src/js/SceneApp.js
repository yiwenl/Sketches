// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewBg from './ViewBg';
import ViewBall from './ViewBall';
import ViewPost from './ViewPost';
import ViewFxaa from './ViewFxaa';
import ViewNoise from './ViewNoise';
import SphereMap from './SphereMap';
import LinesMap from './LinesMap';
import TouchDetect from './TouchDetect';
import LineRenderer from './LineRenderer';

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
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;


		this.orbitalControl.radius.limit(9, 15);

		this.resize();
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

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboFXAA 	= new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		// this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vBg = new ViewBg();
		this._vBall = new ViewBall();
		this._vPost = new ViewPost();
		this._vNoise = new ViewNoise();

		this._touchDetect = new TouchDetect(this._vBall.mesh, this.camera, GL.canvas);


		//	views
		this._vRender = new ViewRender();
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

		this._sphereMap = new SphereMap();
		this._linesMap = new LinesMap();
		this._linesMap.reset(this._fboCurrent);

		this._lineRenderer = new LineRenderer();
	}


	updateFbo() {
		const {hit} = this._touchDetect;

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(2),
			this._fboCurrent.getTexture(3),
			hit
			);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

		this._linesMap.save(this._fboCurrent);
	}


	render() {

		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;

		this._sphereMap.update();


		this._fboRender.bind();

		GL.clear(0, 0, 0, 0);
		GL.disable(GL.DEPTH_TEST);
		this._vBg.render();
		this._vNoise.render();
		GL.enable(GL.DEPTH_TEST);

		this._vBall.render();
		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));
		this._lineRenderer.render(this._linesMap.maps, this._fboCurrent.getTexture(2));

		this._fboRender.unbind();

		//	RENDER POST 
		// this._fboFXAA.bind();
		GL.clear(0, 0, 0, 0);
		this._vPost.render(this._fboRender.getTexture(), this._sphereMap.getTexture());
		// this._fboFXAA.unbind();

		//	OUTPUT WITH FXAA
		// GL.clear(0, 0, 0, 0);
		// this._vFxaa.render(this._fboFXAA.getTexture());
	}


	resize() {
		// const scale = 1.25;
		const scale = 1.;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboFXAA 	= new alfrid.FrameBuffer(GL.width, GL.height);
	}
}


export default SceneApp;