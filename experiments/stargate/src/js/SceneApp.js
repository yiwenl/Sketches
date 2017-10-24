// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewRoom from './ViewRoom';
import ViewSwirl from './ViewSwirl';
import ViewLine from './ViewLine';

import ViewParticles from './ViewParticles';

import Assets from './Assets';
import VRUtils from './utils/VRUtils';
import TouchDetect from './TouchDetect';

const UP = vec3.fromValues(0, 1, 0);
var random = function(min, max) { return min + Math.random() * (max - min);	}

const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}

class SceneApp extends Scene {
	constructor() {
		super();

		//	ORBITAL CONTROL
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.ry.easing = 0.05;
		this.orbitalControl.radius.value = 5;


		//	VR CAMERA
		this.cameraVR = new alfrid.Camera();

		//	MODEL MATRIX
		this._modelMatrix = mat4.create();
		this._tunnelMatrix = mat4.create();
		console.log('Has VR :', VRUtils.hasVR);

		if(!VRUtils.hasVR) {
			this.touchDetect = new TouchDetect(this.camera);
			this.touchDetect.addEventListener('onTouch', (e) => {

				const { position, direction } = e.detail;
				this._createTunnel(position, direction);

			});
		}

		if(VRUtils.canPresent) {
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, 0, -3));
			GL.enable(GL.SCISSOR_TEST);
			this.toRender();

			this.resize();
		}
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		// this._vModel = new ViewObjModel();
		this._vRoom = new ViewRoom();
		this._vSwirl = new ViewSwirl();
		this._vLine = new ViewLine();
		this._vParticles = new ViewParticles();
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


	_createTunnel(mPosition, mDirection) {
		this._hit = mPosition;
		this._dir = mDirection;

		const target = vec3.clone(this._hit);
		vec3.add(target, target, this._dir);

		mat4.lookAt(this._tunnelMatrix, this._hit, target, UP);
		mat4.invert(this._tunnelMatrix, this._tunnelMatrix);


		let angle = random(1, 1.7);
		if(Math.random() > .5) angle *= -1;
		this.orbitalControl.ry.value += angle;
	} 


	renderScene() {
		GL.clear(0, 0, 0, 0);
		this._vRoom.render();
		
		this._bAxis.draw();
		// this._vSwirl.render();
		if(this.touchDetect) {
			// this.touchDetect.render(this.camera);
		}


		if(this._hit) {
			const s = 0.05;
			this._bBall.draw(this._hit, [s, s, s], [1, 0, 0]);
			this._vLine.render(this._hit, this._dir);
		}


		GL.rotate(this._tunnelMatrix);
		this._vSwirl.render();

		GL.enableAdditiveBlending();
		GL.disable(GL.DEPTH_TEST);
		this._vParticles.render();
		GL.enableAlphaBlending();
		GL.enable(GL.DEPTH_TEST);

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