// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import VRUtils from './utils/VRUtils';
import ViewCompose from './ViewCompose';

import WorldGrey from './WorldGrey';
import WorldColor from './WorldColor';
import WorldMap from './WorldMap';

const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}

class SceneApp extends Scene {
	constructor() {
		super();
		
		//	ORBITAL CONTROL
		this.orbitalControl.radius.value = 0.005;
		const easing = 0.02;
		this.x = new alfrid.EaseNumber(0, easing);
		this.z = new alfrid.EaseNumber(-5, easing);

		//	VR CAMERA
		this.cameraVR = new alfrid.Camera();

		//	MODEL MATRIX
		this._modelMatrix = mat4.create();
		this._identiyMatrix = mat4.create();

		if(VRUtils.canPresent) {
			// mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, 0, -3));
			GL.enable(GL.SCISSOR_TEST);
			this.toRender();

			this.resize();
		} else {
			
		}

		mat4.translate(this._modelMatrix, this._identiyMatrix, vec3.fromValues(this.x.value, -1.83, this.z.value));

		gui.add(this, 'move');
	}

	_initTextures() {
		console.log('init textures');

		this.fbo0 = new alfrid.FrameBuffer(GL.width, GL.height);
		this.fbo1 = new alfrid.FrameBuffer(GL.width, GL.height);
		this.fboMap = new alfrid.FrameBuffer(GL.width, GL.height);
	}

	move() {
		this.z.value = -this.z.targetValue;
		// this.orbitalControl.ry.value = this.z.targetValue === -5 ? 0 : Math.PI;
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();

		this._vCompose = new ViewCompose();

		this._worldGrey = new WorldGrey();
		this._worldMap = new WorldMap();
		this._worldColor = new WorldColor(this);
	}


	render() {
		if(!VRUtils.canPresent) { this.toRender(); }
	}


	toRender() {

		//	UPDATE CAMERA POSITION
		mat4.translate(this._modelMatrix, this._identiyMatrix, vec3.fromValues(this.x.value, -1.83, this.z.value));

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

		this._worldColor.update();

		this.fboMap.bind();
		GL.clear(0, 0, 0, 0);
		this._worldMap.render();
		this.fboMap.unbind();

		this.fbo0.bind();
		GL.clear(1, 1, 1, 1);
		this._worldGrey.render();
		this.fbo0.unbind();

		this.fbo1.bind();
		GL.clear(0, 0, 0, 0);
		this._worldColor.render();

		this.fbo1.unbind();

		this._vCompose.render(this.fbo0.getTexture(), this.fbo1.getTexture(), this.fboMap.getTexture());
		
		GL.disable(GL.DEPTH_TEST);
		if(params.debug) {
			this._bCopy.draw(this.fbo1.getTexture());	
		}
		

		if(!GL.isMobile && 0) {
			const s = 200;
			GL.viewport(0, 0, s, s/GL.aspectRatio);
			this._bCopy.draw(this.fbo0.getTexture());
			GL.viewport(s, 0, s, s/GL.aspectRatio);
			this._bCopy.draw(this.fbo1.getTexture());
			GL.viewport(s * 2, 0, s, s/GL.aspectRatio);
			this._bCopy.draw(this.fboMap.getTexture());	
		}

		GL.enable(GL.DEPTH_TEST);
	}


	resize() {
		let scale = VRUtils.canPresent ? 2 : 1;
		if(GL.isMobile) scale = 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;