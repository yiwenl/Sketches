// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewHitTestPlane from './ViewHitTestPlane';
import ViewDrawingBg from './ViewDrawingBg';
import ViewStroke from './ViewStroke';
import ViewMountains from './ViewMountains';
import ViewSky from './ViewSky';
import ViewTerrain from './ViewTerrain';
import Drawing from './Drawing';
import SubsceneParticles from './SubsceneParticles';

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

		this.orbitalControl.rx.value = 0.05;
		this.orbitalControl.center[1] = 1;
		this.orbitalControl.lockZoom(true);
		this.orbitalControl.rx.limit(0.05, Math.PI * 0.1);
		this.camera.setPerspective(60 * RAD, GL.aspectRatio, .1, 100);

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
		this._textureRad = alfrid.GLCubeTexture.parseDDS(getAsset('radiance'));

		this._textureAOTerrain = new alfrid.GLTexture(getAsset('aoTerrain'));
		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);

		this._brushIndex = 0;
		this._textureBrush = new alfrid.GLTexture(getAsset(`brush${this._brushIndex}`));
		this._textureBrushNormal = new alfrid.GLTexture(getAsset(`brushNormal${this._brushIndex}`));
		this._textureBg = new alfrid.GLTexture(getAsset('bg'));
		this._textureNoise = new alfrid.GLTexture(getAsset('noise'));
	}

	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();
		// this._vModel = new ViewObjModel();

		this._vHitPlane = new ViewHitTestPlane();
		this._vDrawingBg = new ViewDrawingBg();
		this._vStroke = new ViewStroke();
		this._vMountains = new ViewMountains();
		this._vSky = new ViewSky();
		this._vTerrain = new ViewTerrain();


		// this._sub = new SubsceneParticles(this);
	}

	_onKey(e) {
		console.log(e.keyCode);

		if(e.keyCode === 32) {	//	spacebar
			this.setInDrawingMode(!this._inDrawingMode);
		}
	}

	setInDrawingMode(mValue) {
		this._inDrawingMode = mValue;

		//	camera
		if(this._inDrawingMode) {
			this.orbitalControl.lock(true);
			this.orbitalControl.rx.value = 0.3;
			this.orbitalControl.radius.value = 15;
			this._drawingOffset.value = 1;
			this._drawing.lock(false);
			this._drawing.clear();
			this._vStroke.clear();
			this._vStroke.show();

			this._brushIndex = Math.floor(Math.random() * 6);
			this._textureBrush.updateTexture(getAsset(`brush${this._brushIndex}`));
			this._textureBrushNormal.updateTexture(getAsset(`brushNormal${this._brushIndex}`));
		} else {
			//	get mesh points from stroke
			this.orbitalControl.lock(false);
			this.orbitalControl.radius.value = 12;
			this._drawingOffset.value = 0;
			this._drawing.lock(true);


			
			if(this._vStroke.mesh) {
				let vertices = this._vStroke.mesh.vertices;
				// console.table(vertices);
				// this._sub.reset(vertices);
				this._vStroke.anim();
			}
		}

	}

	_onUpdatePoints(points, toAddMountains) {
		this._vStroke.updateStroke(points);
		if(!toAddMountains) {	return; 	}
		let positions = this._mountains;

		function distance(a, b) {
			let v = vec3.create();
			vec3.sub(v, a, b);
			return vec3.length(v);
		}

		function checkDist(p) {
			for(let i=0; i<positions.length; i++) {
				let d = distance(p, positions[i]);
				if(d < params.minMountDist) {
					return false;
				}
			}

			return true;
		}


		let cnt = 0;
		points.map( (p) => {
			if(checkDist(p)) {
				p[1] = 0;
				this._mountains.push(p);
				this.addMountain(p);
				cnt ++;
			}
		});

	}


	addMountain(p) {
		this._vMountains.addMountain(p);
	}


	render() {
		if(!this._inDrawingMode) {
			this.orbitalControl.ry.value += 0.002;
		}
		// this._sub.update();
		GL.clear(0, 0, 0, 0);

		GL.setMatrices(this.camera);

		this._vSky.render(this._textureBg, this._drawingOffset.value);
		this._vTerrain.render(this._textureRad, this._textureIrr, this._textureAOTerrain, this._textureNoise, this._drawingOffset.value);

		this._vMountains.render(this._textureRad, this._textureIrr, this._textureNoise, this._drawingOffset.value);
		this._vStroke.render(this._textureBrush, this._textureBrushNormal, this._textureRad, this._textureIrr);

		// this._sub.render();

		if(params.debugHitPlane) {
			this._vHitPlane.render();
		}
	}

	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;