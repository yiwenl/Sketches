// TextureManager.js

import alfrid, { GL, FrameBuffer, CameraOrtho, GLShader } from 'alfrid';
import Emitter from 'events';
import Webcam from './Webcam';
import vsCam from 'shaders/webcam.vert';

class TextureManager extends Emitter {
	constructor() {
		super();
		this._isReady = false;
	}

	init() {
		//	camera ortho
		this._cameraWebcam = new alfrid.CameraOrtho();
		this._canvasScale = 1;
		this.resize();

		Webcam.on('onWebcamUpdated', ()=>this.updateMaps());


		//	
		this.shaderCam        = new GLShader(vsCam, alfrid.ShaderLibs.copyFrag);
		this.meshPlane = alfrid.Geom.plane(1, 1, 1);

		//	framebuffers
		let fboSize           = 256 * 2;
		this._fboBg           = new alfrid.FrameBuffer(fboSize, fboSize);

		//	resizing
		window.addEventListener('resize', ()=>this.resize());

		this._isReady = true;
	}


	updateBackground(useCam=true) {
		this._fboBg.bind();
		GL.clear(1, 0, 0, 1);
		GL.setMatrices(this._cameraWebcam);
		this.shaderCam.bind();
		this.shaderCam.uniform("uScale", "float", this._canvasScale);
		this.shaderCam.uniform("uCanvasSize", "vec2", Webcam.resolution);
		this.shaderCam.uniform("texture", "uniform1i", 0);
		Webcam.texture.bind(0);	
		
		GL.draw(this.meshPlane);
		this._fboBg.unbind();
	}

	updateMaps() {
		//	update 3d mask 
		this.emit('onTextureUpdated');
	}


	resize() {
		const { innerWidth:ww, innerHeight:wh } = window;
		const w2 = ww/2;
		const h2 = wh/2;

		let s = wh / Webcam.height;
		if(Webcam.width * s < ww) {
			s = ww / Webcam.width;
		}

		this._canvasScale = s;

		this._cameraWebcam.ortho(w2, -w2, -h2, h2, .1, 10000);
		this._cameraWebcam.lookAt([0, 0, -100], [0, 0, 0]);
	}

	//	getter setters
	get textureBg() {	return this._fboBg.getTexture();	}

	get all() {
		return [
			this.textureBg
		];
	}
}
const _instance = new TextureManager();


export default _instance;