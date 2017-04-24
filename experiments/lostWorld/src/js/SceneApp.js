// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
// import ViewBoat from './ViewBoat';
import ViewWater from './ViewWater';
import ViewStars from './ViewStars';
import ViewMountains from './ViewMountains';
import ViewDae from './ViewDae';
import Assets from './Assets';
import VIVEUtils from './utils/VIVEUtils';
import getReflectionMatrix from './utils/getReflectionMatrix';
import MountainsMap from './MountainsMap';

const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}

const RAD = Math.PI / 180;
const FOV = 60;

class SceneApp extends Scene {
	constructor() {
		super();
		
		//	ORBITAL CONTROL
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		const far = params.worldSize * 3;
		this.camera.setPerspective(FOV * RAD, GL.aspectRatio, .1, far);
		this.orbitalControl.radius.value = 7;
		this.orbitalControl.radius.limit(6, 10);


		this.cameraReflection = new alfrid.CameraPerspective();
		this.cameraReflection.setPerspective(FOV * RAD, GL.aspectRatio, .1, far);


		//	VR CAMERA
		this.cameraVR = new alfrid.Camera();

		//	MODEL MATRIX
		this._modelMatrix = mat4.create();
		console.log('Has VR :', VIVEUtils.hasVR);

		if(VIVEUtils.hasVR) {
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, 0, -2));
			GL.enable(GL.SCISSOR_TEST);
			this.toRender();

			this.resize();
		} else {
			// mat4.rotateZ(this._modelMatrix, this._modelMatrix, Math.PI);
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, -1, 0));


			// this.orbitalControl.positionOffset[1] = 1;
			// this.orbitalControl.center[1] = 1;
			this.orbitalControl.ry.value = .25;
			this.orbitalControl.rx.limit(0, Math.PI/4);
		}
	}

	_initTextures() {
		console.log('init textures');

		this._fboReflection = new alfrid.FrameBuffer(GL.width, GL.height);
		this._heightMap = new MountainsMap();
		this._heightMap.generate();
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		// this._vBoat = new ViewBoat();
		this._vDae = new ViewDae();
		this._vStars = new ViewStars();
		this._vWater = new ViewWater();
		this._vMountains = new ViewMountains();

		// this._vModel = new ViewObjModel();
	}


	render() {
		if(!VIVEUtils.hasVR) { this.toRender(); }
	}


	toRender() {
		if(VIVEUtils.hasVR) {	VIVEUtils.vrDisplay.requestAnimationFrame(()=>this.toRender());	}		


		if(VIVEUtils.hasVR) {
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
			getReflectionMatrix(this.camera, 0, this.cameraReflection, this._modelMatrix);

			GL.setMatrices(this.cameraReflection);
			this._renderReflection();

			GL.setMatrices(this.camera);
			GL.rotate(this._modelMatrix);
			GL.clear(0, 0, 0, 0);
			this.renderScene(true);
		}
	}


	renderScene(withWater=false) {
		if(withWater) {
			params.clipping.clipDir = 1;
		} else {
			params.clipping.clipDir = -1;
		}

		this._vStars.render();
		this._vMountains.render(this._heightMap.getTexture(), this._heightMap.getNormalTexture());

		if(withWater) {
			this._vWater.render(this._fboReflection.getTexture());	
		}
		this._vDae.render(Assets.get('studio_radiance'), Assets.get('irr'));
	}

	_renderReflection() {
		this._fboReflection.bind();
		GL.clear(0, 0, 0, 0);
		this.renderScene();
		this._fboReflection.unbind();
	}

	resize() {
		const scale = VIVEUtils.hasVR ? 2 : 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
		this.cameraReflection.setAspectRatio(GL.aspectRatio);

		this._fboReflection = new alfrid.FrameBuffer(GL.width, GL.height);
	}
}


export default SceneApp;