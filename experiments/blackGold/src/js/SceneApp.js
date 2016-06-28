// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewStroke from './ViewStroke';
import ViewHitPlane from './ViewHitPlane';
import Drawing from './Drawing';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		//	camera for stroke
		this.cameraDrawing = new alfrid.CameraPerspective();
		this.cameraDrawing.setPerspective(Math.PI * .25, 1, 0.1, 2000);
		this.drawingMatrix = mat4.create();

		//	drawing
		this._drawing = new Drawing(this.camera, this._vHitPlane.mesh);
		this._drawing.on('onMove', (e) => this._onUpdatePoints(e.detail.points));
		this._drawing.on('onUp', (e) => {
			this.setInDrawingMode(false);
			this._onUpdatePoints(e.detail.points);
		});
		this._drawingOffset = new alfrid.TweenNumber(0);

		window.addEventListener('keydown', (e)=>this._onKey(e));
		window.addEventListener('touchstart', ()=> {
			this.setInDrawingMode(true);
		});

		if(GL.isMobile) {
			this.setInDrawingMode(true);
			this.orbitalControl.rx.value = this.orbitalControl.ry.value = -0.2;
		} else {
			this.setInDrawingMode(false);
		}
		
	}

	_initTextures() {
		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'));
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'));
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'));
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'));
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'));
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'));

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);
		this._textureRad = alfrid.GLCubeTexture.parseDDS(getAsset('radiance'));
		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));
		this._brushIndex = 0;
		this._textureBrush = new alfrid.GLTexture(getAsset(`brush${this._brushIndex}`));

		const fboSize = 1024;
		this._fboStroke = new alfrid.FrameBuffer(fboSize, fboSize);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();

		this._vModel = new ViewObjModel();
		this._vStroke = new ViewStroke();
		this._vHitPlane = new ViewHitPlane();
	}

	_onKey(e) {
		// console.log(e.keyCode);

		if(e.keyCode === 32) {	//	spacebar
			this.setInDrawingMode(!this._inDrawingMode);
		}
	}


	setInDrawingMode(mValue) {
		this._inDrawingMode = mValue;

		//	camera
		if(this._inDrawingMode) {
			this.orbitalControl.lock(true);
			this.orbitalControl.radius.value = 7.5;
			this._drawingOffset.value = 1;
			this._drawing.lock(false);
			this._drawing.clear();
			this._vStroke.clear();

			this._brushIndex = Math.floor(Math.random() * 6);
			this._textureBrush.updateTexture(getAsset(`brush${this._brushIndex}`));
		} else {
			this.orbitalControl.lock(false);
			this.orbitalControl.radius.value = 6.5;
			this._drawingOffset.value = 0;
			this._drawing.lock(true);
		}

	}


	_onUpdatePoints(points) {
		this._vStroke.updateStroke(points, this.camera.position);
	}


	render() {
		if(this._inDrawingMode) {
			this.cameraDrawing.lookAt(this.camera.position, [0, 0, 0], [0, 1, 0]);
			mat4.multiply(this.drawingMatrix, this.cameraDrawing.projection, this.cameraDrawing.viewMatrix);
		}
		GL.clear(0, 0, 0, 0);

		this._fboStroke.bind();
		GL.setMatrices(this.cameraDrawing);
		GL.clear(0, 0, 0, 0);
		this._vStroke.render(this._textureBrush);
		this._fboStroke.unbind();


		GL.setMatrices(this.camera);
		this._vModel.render(this._textureRad, this._textureIrr, this._textureAO, this._fboStroke.getTexture(), this.drawingMatrix);
		if(!GL.isMobile) {
			this._vHitPlane.render([this.orbitalControl.rx.value, this.orbitalControl.ry.value], this._drawingOffset.value);	
		}
		

		const size = 200;
		GL.viewport(0, 60, size, size);
		this._bCopy.draw(this._fboStroke.getTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;