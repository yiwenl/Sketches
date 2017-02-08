// Scene.js

import Scheduler from 'scheduling';
import GL from '../GLTool';
import CameraPerspective from '../cameras/CameraPerspective';
import CameraOrtho from '../cameras/CameraOrtho';
import OrbitalControl from '../tools/OrbitalControl';


class Scene {


	constructor() {
		this._init();
		this._initTextures();
		this._initViews();

		this._efIndex = Scheduler.addEF(()=>this._loop());
		window.addEventListener('resize', ()=>this.resize());
	}


	
	//	PUBLIC METHODS

	render() {

	}


	stop() {
		if(this._efIndex === -1) {	return; }
		this._efIndex = Scheduler.removeEF(this._efIndex);
	}


	start() {
		if(this._efIndex !== -1) {
			return;
		} 

		this._efIndex = Scheduler.addEF(()=>this._loop());
	}


	resize() {
	// 	// GL.setSize(window.innerWidth, window.innerHeight);
	// 	// this.camera.setAspectRatio(GL.aspectRatio);
	}


	//	PROTECTED METHODS TO BE OVERRIDEN BY CHILDREN

	_initTextures() {

	}


	_initViews() {

	}


	//	PRIVATE METHODS

	_init() {
		this.camera                 = new CameraPerspective();
		this.camera.setPerspective(45 * Math.PI / 180, GL.aspectRatio, 0.1, 100);
		this.orbitalControl          = new OrbitalControl(this.camera, window, 15);
		this.orbitalControl.radius.value = 10;
		
		this.cameraOrtho            = new CameraOrtho();
	}

	_loop() {

		//	RESET VIEWPORT
		GL.viewport(0, 0, GL.width, GL.height);

		//	RESET CAMERA
		GL.setMatrices(this.camera);


		this.render();
	}
}


export default Scene;