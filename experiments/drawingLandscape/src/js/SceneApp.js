// SceneApp.js

import alfrid, { Scene } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewHitTestPlane from './ViewHitTestPlane';
import ViewDrawingBg from './ViewDrawingBg';
import ViewStroke from './ViewStroke';
import ViewMountains from './ViewMountains';
import ViewSky from './ViewSky';
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
		this._drawing = new Drawing(this.camera, this._vHitPlane.mesh);
		this._drawing.addEventListener('mouseup', ()=> {
			this.setInDrawingMode(false);
		});
		this._drawing.on('onMove', (e) => this._onUpdatePoints(e.detail.points, false));
		this._drawing.on('onUp', (e) => this._onUpdatePoints(e.detail.points, true));
		window.addEventListener('keydown', (e)=>this._onKey(e));
		this.setInDrawingMode(false);

		this._mountains = [];
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
		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);

		this._brushIndex = 0;
		this._textureBrush = new alfrid.GLTexture(getAsset(`brush${this._brushIndex}`));
		this._textureBg = new alfrid.GLTexture(getAsset('bg'));
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
		this._vStroke = new ViewStroke();
		this._vMountains = new ViewMountains();
		this._vSky = new ViewSky();
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
			this.orbitalControl.radius.value = 15;
			this._drawingOffset.value = 1;
			this._drawing.lock(false);
			this._drawing.clear();
			this._vStroke.clear();

			this._brushIndex = Math.floor(Math.random() * 6);
			this._textureBrush.updateTexture(getAsset(`brush${this._brushIndex}`));
		} else {
			this.orbitalControl.lock(false);
			this.orbitalControl.radius.value = 12;
			this._drawingOffset.value = 0;
			this._drawing.lock(true);
		}

	}

	_onUpdatePoints(points, toAddMountains) {
		this._vStroke.updateStroke(points);
		if(!toAddMountains) {	return; 	}
		let positions = this._mountains;
		console.log('Positions : ', positions.length);

		function distance(a, b) {
			let v = vec3.create();
			vec3.sub(v, a, b);
			return vec3.length(v);
		}

		function checkDist(p) {
			for(let i=0; i<positions.length; i++) {
				let d = distance(p, positions[i]);
				console.log(d );
				if(d < params.minMountDist) {
					return false;
				}
			}

			return true;
		}


		console.log('Points : ', points.length);
		let cnt = 0;
		points.map( (p) => {
			if(checkDist(p)) {
				p[1] = 1;
				this._mountains.push(p);
				this.addMountain(p);
				cnt ++;
			}
		});

		console.log('Mountains :', cnt);
	}


	addMountain(p) {
		this._vMountains.addMountain(p);
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vSky.render(this._textureBg);

		this._fboRender.unbind();

		

		GL.disable(GL.DEPTH_TEST);
		this._vDrawingBg.render(this._fboRender.getTexture(), this._drawingOffset.value);	
		GL.enable(GL.DEPTH_TEST);

		
		this._vMountains.render(this._textureBg);
		this._vStroke.render(this._textureBrush);

		if(params.debugHitPlane) {
			this._vHitPlane.render();
		}

		// let size = .1 * .5;
		// let points = this._drawing.points;

		// points.map( (p, i) => {
		// 	this._bBall.draw(p, [size, size, size], [1, 1, 1], 1);
		// });


		// size = .1;
		// this._vMountains.positions.map( (p) => {
		// 	this._bBall.draw(p, [size, size, size], [1, .7, .5], 1);
		// });
	}

	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;