// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewStroke from './ViewStroke';
import ViewHitPlane from './ViewHitPlane';
import Drawing from './Drawing';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this._count = 0;

		//	camera for stroke
		this.cameraDrawing = new alfrid.CameraPerspective();
		this.cameraDrawing.setPerspective(Math.PI * .25, 1, 0.1, 2000);
		this.drawingMatrix = mat4.create();
		this.matrixInvViewProj = mat4.create();
		this.mProjInv = mat4.create();
		this.mViewInv = mat4.create();

		//	drawing
		this._drawing = new Drawing(this.camera, this._vHitPlane.mesh);
		this._drawing.on('onMove', (e) => this._onUpdatePoints(e.detail.points));
		this._drawing.on('onUp', (e) => {
			this.setInDrawingMode(false);
			this._onUpdatePoints(e.detail.points);
		});
		this._drawingOffset = new alfrid.TweenNumber(0);
		this._hasDrawing = false;
		this._isFirstTime = true;

		//	canvas for fbo
		this._canvasStroke = document.createElement("canvas");
		this._canvasStroke.width = params.numParticles;
		this._canvasStroke.height = params.numParticles;
		this._imgDataStroke = new Uint8Array(params.numParticles * params.numParticles * 4);
		this._ctxStroke = this._canvasStroke.getContext('2d');
		this._offset = new alfrid.TweenNumber(0, 'linear', 0.01);

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

		this._fboRender = new alfrid.FrameBuffer(params.numParticles, params.numParticles);

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();

		this._vModel = new ViewObjModel();
		this._vStroke = new ViewStroke();
		this._vHitPlane = new ViewHitPlane();
		this._vSave = new ViewSave();
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
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
			let dir = Math.random() < .5 ? 1 : -1;
			this.orbitalControl.ry.value += .35 * dir;
			this.orbitalControl.radius.value = 5;
			this._drawingOffset.value = 0;
			this._drawing.lock(true);

			if(!this._isFirstTime) {
				this._resetParticlePositions();	
			}
		}

		this._isFirstTime = false;
	}

	_resetParticlePositions() {
		mat4.mul(this.matrixInvViewProj, this.camera.projection, this.camera.matrix);
		mat4.invert(this.matrixInvViewProj, this.matrixInvViewProj);
		mat4.invert(this.mProjInv, this.camera.projection);
		mat4.invert(this.mViewInv, this.camera.matrix);

		this._offset.setTo(0);
		this._offset.value = 2.0;

		this._getStrokeCanvas();
		this._vSave.save(this._imgDataStroke);

		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render(this._fboRender.getTexture(), this._fboRender.getDepthTexture(), this.mViewInv, this.mProjInv, this.camera.eye);	
		this._fboCurrent.unbind();

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render(this._fboRender.getTexture(), this._fboRender.getDepthTexture(), this.mViewInv, this.mProjInv, this.camera.eye);	
		this._fboTarget.unbind();

		this._hasDrawing = true;
	}

	_getStrokeCanvas() {
		const size = params.numParticles;
		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vModel.render(this._textureRad, this._textureIrr, this._textureAO, this._fboStroke.getTexture(), this.drawingMatrix);
		GL.gl.readPixels(0, 0, size, size, GL.gl.RGBA, GL.gl.UNSIGNED_BYTE, this._imgDataStroke);
		this._fboRender.unbind();
		this._needUpdateStrokeData = false;

		const imageData = this._ctxStroke.createImageData(size, size);
		imageData.data.set(this._imgDataStroke);
		this._ctxStroke.putImageData(imageData, 0, 0);
	}


	_onUpdatePoints(points) {
		this._vStroke.updateStroke(points, this.camera.position);
	}


	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2), this._fboCurrent.getTexture(3), this._offset.value);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;
	}

	render() {
		if(this._inDrawingMode) {
			this.cameraDrawing.lookAt(this.camera.position, [0, 0, 0], [0, 1, 0]);
			mat4.multiply(this.drawingMatrix, this.cameraDrawing.projection, this.cameraDrawing.viewMatrix);
		}

		let p = 0;
		//	update fbo 
		
		GL.clear(0, 0, 0, 0);	

		if(this._inDrawingMode) {
			this._fboStroke.bind();
			GL.setMatrices(this.cameraDrawing);
			GL.clear(0, 0, 0, 0);
			this._vStroke.render(this._textureBrush);
			this._fboStroke.unbind();	
		}

		GL.setMatrices(this.camera);

		if(this._hasDrawing && !this._inDrawingMode) { 
			this._count ++;
			if(this._count % params.skipCount == 0) {
				this._count = 0;
				this.updateFbo();
			}
			p = this._count / params.skipCount;	
			this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(3), this._fboCurrent.getTexture(2));
		} 

		
		this._vModel.render(this._textureRad, this._textureIrr, this._textureAO, this._fboStroke.getTexture(), this.drawingMatrix);
		if(!GL.isMobile) {
			this._vHitPlane.render([this.orbitalControl.rx.value, this.orbitalControl.ry.value], this._drawingOffset.value);	
		}

		
		//	DEBUG
		const size = params.numParticles/2;
		// GL.viewport(0, 60, size, size);
		// // this._bCopy.draw(this._fboStroke.getTexture());
		// this._bCopy.draw(this._fboRender.getTexture());

		// GL.viewport(0, 60+size, size, size);
		// this._bCopy.draw(this._fboRender.getDepthTexture());


		// if(this._hasDrawing) {
		// 	GL.viewport(0, 60+size*2, size, size);
		// 	this._bCopy.draw(this._fboCurrent.getTexture(0));

		// 	GL.viewport(0, 60+size*3, size, size);
		// 	this._bCopy.draw(this._fboCurrent.getTexture(2));

		// 	GL.viewport(0, 60+size*4, size, size);
		// 	this._bCopy.draw(this._fboCurrent.getTexture(3));
		// }


		// for(let i=0; i<4; i++) {
		// 	GL.viewport(0, 60 + size * i, size, size);
		// 	this._bCopy.draw(this._fboCurrent.getTexture(i));

		// 	GL.viewport(size, 60 + size * i, size, size);
		// 	this._bCopy.draw(this._fboTarget.getTexture(i));
		// }
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;