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
		// this.orbitalControl.rx.limit(-.3, .3);
		const range = Math.PI * .35;
		// this.orbitalControl.ry.limit(-range, range);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 7.5;

		//	drawing
		this._drawing = new Drawing(this.camera, this._vHitPlane.mesh);
		this._drawing.on('onMove', (e) => this._onUpdatePoints(e.detail.points));
		this._drawing.on('onUp', (e) => {
			this.setInDrawingMode(false);
			this._onUpdatePoints(e.detail.points);
		});
		this._drawingOffset = new alfrid.TweenNumber(0);

		window.addEventListener('keydown', (e)=>this._onKey(e));
		this.setInDrawingMode(false);
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
			this.orbitalControl.radius.value = 8.5;
			this._drawingOffset.value = 1;
			this._drawing.lock(false);
			this._drawing.clear();
			this._vStroke.clear();

			this._brushIndex = Math.floor(Math.random() * 6);
			this._textureBrush.updateTexture(getAsset(`brush${this._brushIndex}`));
		} else {
			this.orbitalControl.lock(false);
			this.orbitalControl.radius.value = 7.5;
			this._drawingOffset.value = 0;
			this._drawing.lock(true);
		}

	}


	_onUpdatePoints(points) {
		this._vStroke.updateStroke(points, this.camera.position);
	}


	render() {
		GL.clear(0, 0, 0, 0);
		// this._bSkybox.draw(this._textureRad);
		this._bAxis.draw();
		this._bDots.draw();

		this._vModel.render(this._textureRad, this._textureIrr, this._textureAO);
		GL.disable(GL.CULL_FACE);
		this._vStroke.render(this._textureBrush);
		GL.enable(GL.CULL_FACE);

		this._vHitPlane.render([this.orbitalControl.rx.value, this.orbitalControl.ry.value], this._drawingOffset.value);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;