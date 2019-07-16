// Webcam.js

import alfrid, { GL } from 'alfrid';
import Emitter from 'events';

class Webcam extends Emitter {

	init(mWebcam, mCanvas) {

		console.log('init camera');
		console.log('init camera');
		console.log('init camera');
		console.log('init camera');
		this._cam = mWebcam;
		this._canvasCam = mCanvas;

		this._texture = new alfrid.GLTexture(mCanvas);

		const FPS = 30;
		setInterval(()=> this._updateTexture(), 1000/FPS);

		this.width = this._canvasCam.width;
		this.height = this._canvasCam.height;
		this.aspectRatio = this.width / this.height;

		this.resolution = [this.width, this.height];
	}


	_updateTexture() {
		this._texture.updateTexture(this._canvasCam);

		this.emit('onWebcamUpdated');
	}



	get texture() {
		return this._texture;
	}

}


const _instance = new Webcam();

export default _instance;