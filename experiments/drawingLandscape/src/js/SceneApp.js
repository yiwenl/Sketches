// SceneApp.js

import alfrid, { Scene } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewHitTestPlane from './ViewHitTestPlane';
import ViewDrawingBg from './ViewDrawingBg';
import Drawing from './Drawing';

window.getAsset = function (id) {
	for(var i = 0; i < assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
};

const GL = alfrid.GL;
const RAD = Math.PI/180;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = .3;
		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 100);

		this._inDrawingMode = false;
		this._drawingOffset = new alfrid.TweenNumber(0);
		this._drawing = new Drawing();
		this._drawing.addEventListener('mouseup', ()=> {
			this.setInDrawingMode(false);
		});
		window.addEventListener('keydown', (e)=>this._onKey(e));
	}

	_initTextures() {
		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'));
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'));
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'));
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'));
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'));
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'));

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);

		let rad_posx = alfrid.HDRLoader.parse(getAsset('rad_posx'));
		let rad_negx = alfrid.HDRLoader.parse(getAsset('rad_negx'));
		let rad_posy = alfrid.HDRLoader.parse(getAsset('rad_posy'));
		let rad_negy = alfrid.HDRLoader.parse(getAsset('rad_negy'));
		let rad_posz = alfrid.HDRLoader.parse(getAsset('rad_posz'));
		let rad_negz = alfrid.HDRLoader.parse(getAsset('rad_negz'));

		this._textureRad = new alfrid.GLCubeTexture([rad_posx, rad_negx, rad_posy, rad_negy, rad_posz, rad_negz]);

		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();
		// this._vModel = new ViewObjModel();

		this._vHitPlane = new ViewHitTestPlane();
		this._vDrawingBg = new ViewDrawingBg();
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
			this.orbitalControl.radius.value = 12;
			this._drawingOffset = 1;
			this._drawing.lock(false);
		} else {
			this.orbitalControl.lock(false);
			this.orbitalControl.radius.value = 15;
			this._drawingOffset = 0;
			this._drawing.lock(true);
		}

	}


	render() {
		GL.clear(0, 0, 0, 0);

		if(this._inDrawingMode) {
			this._fboRender.bind();
			GL.clear(0, 0, 0, 0);
			this._bAxis.draw();
			this._bDots.draw();	
			this._fboRender.unbind();

			this._vDrawingBg.render(this._fboRender.getTexture());	

		} else {
			this._bAxis.draw();
			this._bDots.draw();	
		}


		if(params.debugHitPlane) {
			this._vHitPlane.render();
		}
		
		// this._vModel.render(this._textureRad, this._textureIrr, this._textureAO);
	}

	_hitTest() {

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;