// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import ViewGrids from './ViewGrids';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 55;
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._vGrids = new ViewGrids();


		this.camDiv = document.body.querySelector('.webcam');
		// this.canvasCam = document.createElement("canvas");
		// this.canvasCam.width = 640;
		// this.canvasCam.height = 480;
		// this.ctxCam = this.canvasCam.getContext('2d');
		this.textureCam = new alfrid.GLTexture(this.camDiv);


		if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		    // Not adding `{ audio: true }` since we only want video now
		    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
		        this.camDiv.src = window.URL.createObjectURL(stream);
		        this.camDiv.play();

		        this.updateCamTexture();
		    });
		}
	}


	updateCamTexture() {
		this.textureCam.updateTexture(this.camDiv);


		const fps = 24;
		setTimeout(()=>this.updateCamTexture(), 1000/fps)
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._vGrids.render(this.textureCam);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;