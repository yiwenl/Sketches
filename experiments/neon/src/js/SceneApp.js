// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewStatue from './ViewStatue';
import ViewHitPlane from './ViewHitPlane';
import ViewBackground from './ViewBackground';
import ViewStroke from './ViewStroke';
import ViewRefraction from './ViewRefraction';
import Drawing from './Drawing';
import PassBloom from './PassBloom';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = -0.3;
		this.orbitalControl.radius.value = 4;
	}


	_initTextures() {

		const oRender = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR
		};

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._fboStroke = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._fboRefraction = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		// this._fboFXAA = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._brushIndex = 0;
		this._textureBrush = Assets.get(`brush${this._brushIndex}Normal`);
	}


	_initViews() {
		console.log('init views');

		this._bCopy       = new alfrid.BatchCopy();
		this._vStatue     = new ViewStatue();
		this._vBackground = new ViewBackground();
		this._vHit        = new ViewHitPlane();
		this._vStroke     = new ViewStroke();
		this._vRefract 	  = new ViewRefraction();
		this._passBloom   = new PassBloom(4, .25);

		this._drawing = new Drawing(this.camera, this._vHit.mesh);
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
			this.orbitalControl.radius.value = 5;
			this._drawingOffset.value = 1;
			this._drawing.lock(false);
			this._drawing.clear();
			this._vStroke.clear();
			this._vHit.opacity.value = .25;

			this._brushIndex = Math.floor(Math.random() * 3);
			this._textureBrush = Assets.get(`brush${this._brushIndex}Normal`);
		} else {
			this.orbitalControl.lock(false);
			this.orbitalControl.radius.value = 4;
			this._drawingOffset.value = 0;
			this._drawing.lock(true);

			this._vHit.opacity.value = 0;
		}

	}


	_onUpdatePoints(points) {
		this._vStroke.updateStroke(points, this.camera.position);
	}


	render() {

		this._fboStroke.bind();
		GL.clear(0, 0, 0, 0);
		this._vStroke.render(this._textureBrush);
		this._fboStroke.unbind();

		this._fboRender.bind();
		GL.clear(0, 0, 0, 1);

		GL.disable(GL.DEPTH_TEST);
		this._vBackground.render();
		GL.enable(GL.DEPTH_TEST);
		
		this._vStatue.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aoStatue'));
		this._vHit.render();
		this._fboRender.unbind();


		this._fboRefraction.bind();
		GL.clear(0, 0, 0, 0);
		this._vRefract.render(this._fboRender.getTexture(), this._fboStroke.getTexture(), Assets.get('studio_radiance'));
		this._fboRefraction.unbind();


		this._passBloom.render(this._fboRefraction.getTexture());
		GL.clear(0, 0, 0, 0);
		GL.disable(GL.DEPTH_TEST);
		GL.viewport(0, 0, GL.width, GL.height);
		GL.enableAdditiveBlending();
		this._bCopy.draw(this._fboRefraction.getTexture());
		this._bCopy.draw(this._passBloom.getTexture());

		// GL.setMatrices(this.camera);
		// this._vHit.render();

		GL.enableAlphaBlending();

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);

		const oRender = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR
		};

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._fboStroke = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._fboRefraction = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
	}
}


export default SceneApp;