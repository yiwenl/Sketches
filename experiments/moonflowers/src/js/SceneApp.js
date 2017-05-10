// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import VIVEUtils from './utils/VIVEUtils';
import NoiseMap from './NoiseMap';

import ViewTerrain from './ViewTerrain';

const RAD = Math.PI / 180;

const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}

class SceneApp extends Scene {
	constructor() {
		super();
		
		//	ORBITAL CONTROL
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.radius.value = 5;
		this.camera.setPerspective(60 * RAD, GL.aspectRatio, .2, 100);


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
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, -2, 0));
		}
	}

	_initTextures() {
		console.log('init textures');

		this._noiseMap = new NoiseMap();
		console.log(this._noiseMap.height);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox(50);
		this._bBall = new alfrid.BatchBall();

		this._vTerrain = new ViewTerrain();
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
			GL.setMatrices(this.camera);
			GL.rotate(this._modelMatrix);
			this.renderScene();

			GL.disable(GL.DEPTH_TEST);
			const s = 200;
			GL.viewport(0, 0, s, s);
			this._bCopy.draw(this._noiseMap.height);


			GL.viewport(s, 0, s, s);
			this._bCopy.draw(this._noiseMap.normal);

			GL.enable(GL.DEPTH_TEST);
		}
	}


	renderScene() {
		GL.clear(0, 0, 0, 0);
		this._bSky.draw(Assets.get('irr'));

		this._bAxis.draw();
		this._bDots.draw();

		const r = 30;
		this._bBall.draw([r, 0, 0]);
		this._bBall.draw([-r, 0, 0]);
		this._bBall.draw([0, 0, r]);
		this._bBall.draw([0, 0, -r]);

		// this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));

		this._vTerrain.render(this._noiseMap.height, this._noiseMap.normal);
	}


	resize() {
		const scale = VIVEUtils.hasVR ? 2 : 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;