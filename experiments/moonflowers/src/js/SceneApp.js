// SceneApp.js

import alfrid, { Scene, GL, CameraPerspective, CameraOrtho } from 'alfrid';
import Assets from './Assets';
import VIVEUtils from './utils/VIVEUtils';
import NoiseMap from './NoiseMap';
import ViewTerrain from './ViewTerrain';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import CameraControl from './CameraControl';
import TouchOrientationControl from './cameraControls/TouchOrientationControl';

const RAD = Math.PI / 180;

const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}

class SceneApp extends Scene {
	constructor() {
		super();
		
		//	ORBITAL CONTROL
		this._cameraControl = CameraControl(this.camera, window);
		this.camera.setPerspective(60 * RAD, GL.aspectRatio, .2, 100);
		alfrid.Scheduler.addEF(()=>this._cameraControl.update());


		//	VR CAMERA
		this.cameraVR = new alfrid.Camera();

		//	MODEL MATRIX
		this._modelMatrix = mat4.create();
		console.log('Has VR :', VIVEUtils.hasVR, ' can present :', VIVEUtils.canPresent);

		if(VIVEUtils.canPresent) {
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, 0, -2));
			GL.enable(GL.SCISSOR_TEST);
			this.toRender();

			this.resize();
		} else {
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, -4, 0));
		}

		this._count = 0;
	}

	_init() {
		this.camera                 = new CameraPerspective();
		this.camera.setPerspective(45 * Math.PI / 180, GL.aspectRatio, 0.1, 100);

		this.cameraOrtho            = new CameraOrtho();
	}

	_initTextures() {
		// console.log('init textures');

		this._noiseMap = new NoiseMap();
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();

		this._vTerrain = new ViewTerrain();

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

		if(!VIVEUtils.canPresent) { this.toRender(); }
	}


	toRender() {
		if(VIVEUtils.canPresent) {	VIVEUtils.vrDisplay.requestAnimationFrame(()=>this.toRender());	}		


		/*
	
			if(VR.canPresent) {
				if(VR.isPresenting) {
					//	use left eye camera
					//	use right eye camera
				} else {
					//	use left eye view matrix
					//	use custom projection matrix
				}
			} else {
				use normal camera + orbital camera control
			}

		*/


		if(VIVEUtils.canPresent) {
			VIVEUtils.getFrameData();
			const w2 = GL.width/2;
			VIVEUtils.setCamera(this.cameraVR, 'left');

			scissor(0, 0, w2, GL.height);
			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();


			VIVEUtils.setCamera(this.cameraVR, 'right');
			scissor(w2, 0, w2, GL.height);
			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();

			VIVEUtils.submitFrame();

			//	re-render whole
			scissor(0, 0, GL.width, GL.height);

			GL.clear(0, 0, 0, 0);
			mat4.copy(this.cameraVR.projection, this.camera.projection);

			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();

		} else {
			GL.setMatrices(this.camera);
			GL.rotate(this._modelMatrix);
			this.renderScene();

			// GL.disable(GL.DEPTH_TEST);
			// const s = 200;
			// GL.viewport(0, 0, s, s);
			// this._bCopy.draw(this._noiseMap.height);


			// GL.viewport(s, 0, s, s);
			// this._bCopy.draw(this._noiseMap.normal);

			// GL.enable(GL.DEPTH_TEST);
		}

		
	}


	renderScene() {
		GL.clear(0, 0, 0, 0);
		this._vTerrain.render(this._noiseMap.height, this._noiseMap.normal);

		let p = this._count / params.skipCount;
		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));
	}


	resize() {
		let scale = VIVEUtils.canPresent ? 2 : 1;
		if(GL.isMobile) scale = 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;