// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import VRUtils from './utils/VRUtils';
import ViewBalls from './ViewBalls';
import ViewBox from './ViewBox';
import ViewBoxMap from './ViewBoxMap';
import ViewSphere from './ViewSphere';
import ViewCompose from './ViewCompose';

const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}

class SceneApp extends Scene {
	constructor() {
		super();
		
		//	ORBITAL CONTROL
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.2;
		this.orbitalControl.radius.value = 5;


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
		}
	}

	_initTextures() {
		console.log('init textures');

		this.fbo0 = new alfrid.FrameBuffer(GL.width, GL.height);
		this.fbo1 = new alfrid.FrameBuffer(GL.width, GL.height);
		this.fboMap = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();

		this._vModel0 = new ViewObjModel();
		this._vModel1 = new ViewObjModel();

		this._vModel0.scale = this._vModel1.scale = 0.5;
		const r = 2;
		this._vModel0.position = [0, 0, -r];
		this._vModel1.position = [0, 0,  r];
		this._vModel1.roughness = .5;
		this._vModel1.metallic = 1;
		this._vModel1.rotation = Math.PI;

		this._vBalls = new ViewBalls();
		this._vBox = new ViewBox();
		this._vBoxMap = new ViewBoxMap();
		this._vSphere = new ViewSphere();
		this._vCompose = new ViewCompose();
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
		this.renderMap();

		this.fbo0.bind();
		GL.clear(0, 0, 0, 1);
		this._vBalls.render();
		this._vBox.render();
		this.fbo0.unbind();

		this.fbo1.bind();
		GL.clear(0, 0, 0, 0);
		this._vModel0.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));
		this.fbo1.unbind();



		this._vCompose.render(this.fbo0.getTexture(), this.fbo1.getTexture(), this.fboMap.getTexture());
		
		// this._vModel1.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));

		GL.disable(GL.DEPTH_TEST);
		const s = 200;
		GL.viewport(0, 0, s, s/GL.aspectRatio);
		this._bCopy.draw(this.fbo0.getTexture());
		GL.viewport(s, 0, s, s/GL.aspectRatio);
		this._bCopy.draw(this.fbo1.getTexture());
		GL.viewport(s * 2, 0, s, s/GL.aspectRatio);
		this._bCopy.draw(this.fboMap.getTexture());
		GL.enable(GL.DEPTH_TEST);
	}


	renderMap() {
		this.fboMap.bind();
		GL.clear(0, 0, 0, 0);
		this._vSphere.render();
		this._vBalls.renderColor();

		GL.gl.cullFace(GL.gl.FRONT);
		this._vBoxMap.color = [1, 0, 0];
		this._vBoxMap.render();
		GL.gl.cullFace(GL.gl.BACK);
		this._vBoxMap.color = [0, 0, 1];
		this._vBoxMap.render();
		
		this.fboMap.unbind();
	}


// sudo code

/*

	render map : 

	render sphere in red
	render box invert in blue
	render box normal in red
	render all other meshes in red


	render normal scene

	render invert scene



*/


	resize() {
		let scale = VRUtils.canPresent ? 2 : 1;
		if(GL.isMobile) scale = 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;