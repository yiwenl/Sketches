// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewTerrain from './ViewTerrain';
import ViewWater from './ViewWater';
import ViewStars from './ViewStars';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		const RAD = Math.PI/180;
		const FOV = 60 * RAD;

		this.camera.setPerspective(FOV, GL.aspectRatio, .1, 100);
		this.cameraReflection = new alfrid.CameraPerspective();
		this.cameraReflection.setPerspective(FOV, GL.aspectRatio, .1, 100);

		this.orbitalControl.radius.value = 10;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.center[1] = 2;
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

		this._fboReflection = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboRefraction = new alfrid.FrameBuffer(GL.width, GL.height);
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
		this._vTerrain = new ViewTerrain();
		this._vWater = new ViewWater();
		this._vStars = new ViewStars();

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
		const { eye, center } = this.camera;
		let distToWater = eye[1] - params.seaLevel;
		const eyeRef = [eye[0], eye[1] - distToWater * 2.0, eye[2]];
		distToWater = center[1] - params.seaLevel;
		const centerRef = [center[0], center[1] - distToWater * 2.0, center[2]];
		this.cameraReflection.lookAt(eyeRef, centerRef);

		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}
		let p = this._count / params.skipCount;
		
		params.clipY = params.seaLevel;

		this._fboReflection.bind();
		GL.clear(0, 0, 0, 0);
		params.clipDir = -1;
		GL.setMatrices(this.cameraReflection);
		this.renderScene();
		this._fboReflection.unbind();

		this._fboRefraction.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		params.clipDir = 1;
		this.renderScene();
		this._fboRefraction.unbind();

		
		params.clipY = 999;
		params.clipDir = 1;

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		this.renderScene(true);
	}


	renderScene(withWater=false) {
		let p = this._count / params.skipCount;

		this._vStars.render();
		this._vTerrain.render();	
		if(withWater) {
			this._vWater.render(this._fboReflection.getTexture(), this._fboRefraction.getTexture());
		} else {

		}
		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);

		this._fboReflection = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboRefraction = new alfrid.FrameBuffer(GL.width, GL.height);
	}
}


export default SceneApp;