// SceneApp.js

import alfrid, { Scene, GL, Ray } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewAO from './ViewAO';
import ViewPost from './ViewPost';
import ViewFXAA from './ViewFXAA';
import ViewFloor from './ViewFloor';
import ViewBall from './ViewBall';
import ViewBackground from './ViewBackground';
import TouchDetect from './TouchDetect';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, 1, 50);
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.radius.limit(7, 20);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		this.lightPos = [0.1, 1, 1];
		this._touchDetect = new TouchDetect(this._vBall.mesh, this.camera, GL.canvas);

		this._touchDetect.on('down', ()=>this._onDown());
		this._touchDetect.on('up', ()=>this._onUp());

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
		const oPost = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
		};

		//*/
		const fboScale = params.highSetting ? 1 : 0.5;
		this._fboTmp 	= new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale, oPost);
		this._fboAO 	= new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale, oPost);
		/*/
		const fboSize = 512 * 2;
		this._fboTmp 	= new alfrid.FrameBuffer(fboSize, fboSize, oPost);
		this._fboAO 	= new alfrid.FrameBuffer(fboSize, fboSize, oPost);
		//*/


		this._fboFXAA  = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		// this._bCopy = new alfrid.BatchCopy();
		// this._bDots = new alfrid.BatchDotsPlane();
		// this._ball = new alfrid.BatchBall();


		const meshTri = alfrid.Geom.bigTriangle();

		//	views
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim(meshTri);
		this._vAO 	  = new ViewAO(meshTri);
		this._vPost   = new ViewPost(meshTri);
		this._vFXAA   = new ViewFXAA(meshTri);
		this._vFloor  = new ViewFloor();
		this._vBall   = new ViewBall();
		this._vBg 	  = new ViewBackground();

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


	_onDown() {
		this._vPost.invert.value = 1;
	}


	_onUp() {
		this._vPost.invert.value = 0;
	}


	updateFbo() {
		const { hit, isMouseDown } = this._touchDetect;
		
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2), hit, isMouseDown);
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
		const s = 3;
		const { hit, isMouseDown } = this._touchDetect;

		//	RENDER
		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vFloor.render();
		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), this.lightPos);
		this._vBall.render(this.lightPos);
		let ss = 0.1
		// this._ball.draw(hit, [ss, ss, ss], [.85, 0, 0]);
		this._fboRender.unbind();

		//	RENDER SSAO
		this._fboAO.bind();
		GL.clear(0, 0, 0, 0);
		this._vAO.render(this._fboRender.getDepthTexture(), this._fboAO.width, this._fboAO.height);
		this._fboAO.unbind();


		//	FXAA
		GL.disable(GL.DEPTH_TEST);
		this._fboFXAA.bind();
		GL.clear(0, 0, 0, 0);
		this._vBg.render();
		this._vPost.render(this._fboRender.getTexture(), this._fboAO.getTexture());
		this._fboFXAA.unbind();
		

		//	FINAL OUPUT

		GL.clear(0, 0, 0, 0);

		this._vFXAA.render(this._fboFXAA.getTexture());
		GL.enable(GL.DEPTH_TEST);

		// const size = 200;
		// GL.viewport(0, 0, size, size);
		// this._bCopy.draw(this._fboRender.getDepthTexture());

		// GL.viewport(0, size, size, size);
		// this._bCopy.draw(this._fboAO.getTexture());
	}


	resize() {
		const scale = params.highSetting ? 2 : 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;