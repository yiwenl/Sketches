// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import VRUtils from './utils/VRUtils';
// import ViewSkybox from './ViewSkybox';
import ViewDome from './ViewDome';
import ViewRings from './ViewRings';

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
		this._hit = vec3.create();

		//	VR CAMERA
		this.cameraVR = new alfrid.Camera();

		//	MODEL MATRIX
		this._modelMatrix = mat4.create();
		console.log('Has VR :', VRUtils.hasVR);

		if(VRUtils.canPresent) {
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, 0, -3));
			GL.enable(GL.SCISSOR_TEST);
			this.toRender();

			this.resize();
		} else {

			console.log('here');
			const mesh = new alfrid.Geom.sphere(params.skyboxSize, 12, true);
			this._detector = new TouchDetector(mesh, this.camera);

			// this._detector.on('onHit', (e)=>this._onHit(e.detail.hit));
			this._detector.on('onDown', (e)=>this._onHit(e.detail.hit));
		}


	}


	_onHit(mHit) {
		vec3.copy(this._hit, mHit);
		this._vDome.radius.value = 1;
		this._vRings.updateMatrix(this._hit);
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bBall = new alfrid.BatchBall();
		// this._bSky = new alfrid.BatchSkybox();

		// this._vSkybox = new ViewSkybox();
		this._vDome = new ViewDome();
		this._vRings = new ViewRings();

		// this._vModel = new ViewObjModel();
	}


	render() {
		if(!VRUtils.canPresent) { this.toRender(); }
	}


	toRender() {
		if(VRUtils.canPresent) {	VRUtils.vrDisplay.requestAnimationFrame(()=>this.toRender());	}		

		VRUtils.getFrameData();

		if(VRUtils.isPresenting) {
			
			const w2 = GL.width/2;
			VRUtils.setCamera(this.cameraVR, 'left');
			scissor(0, 0, w2, GL.height);
			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();


			VRUtils.setCamera(this.cameraVR, 'right');
			scissor(w2, 0, w2, GL.height);
			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();

			VRUtils.submitFrame();

			//	re-render whole
			scissor(0, 0, GL.width, GL.height);

			GL.clear(0, 0, 0, 0);
			mat4.copy(this.cameraVR.projection, this.camera.projection);

			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();

		} else {

			if(VRUtils.canPresent) {
				VRUtils.setCamera(this.cameraVR, 'left');
				mat4.copy(this.cameraVR.projection, this.camera.projection);

				scissor(0, 0, GL.width, GL.height);
				GL.setMatrices(this.cameraVR);
				GL.rotate(this._modelMatrix);
				this.renderScene();
			} else {
				GL.setMatrices(this.camera);
				GL.rotate(this._modelMatrix);
				this.renderScene();	
			}
			
		}
	}


	renderScene() {
		GL.clear(0, 0, 0, 0);
		// this._bSky.draw(Assets.get('irr'));
		// this._vSkybox.render();
		this._vDome.render(this._hit);

		this._vRings.render();

		const s = .1;
		this._bBall.draw(this._hit, [s, s, s], [1, 0, 0]);
		this._bAxis.draw();


		// this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));
	}


	resize() {
		let scale = VRUtils.canPresent ? 2 : 1;
		if(GL.isMobile) scale = window.devicePixelRatio;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}

}


export default SceneApp;