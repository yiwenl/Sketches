// SceneApp.js

import alfrid , { Scene } from 'alfrid';
import ViewObjModel from './ViewObjModel';

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this.orbitalControl.radius.value = 5;
		this.orbitalControl.radius.limit(2, 15 );
		window.addEventListener('keydown', (e)=>this._onKey(e));
	}

	_initTextures() {
		console.log('init textures');
		function getAsset(id) {
			for(var i=0; i<assets.length; i++) {
				if(id === assets[i].id) {
					return assets[i].file;
				}
			}
		}

		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'))
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'))
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'))
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'))
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'))
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'))

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);

		let rad_posx = alfrid.HDRLoader.parse(getAsset('rad_posx'))
		let rad_negx = alfrid.HDRLoader.parse(getAsset('rad_negx'))
		let rad_posy = alfrid.HDRLoader.parse(getAsset('rad_posy'))
		let rad_negy = alfrid.HDRLoader.parse(getAsset('rad_negy'))
		let rad_posz = alfrid.HDRLoader.parse(getAsset('rad_posz'))
		let rad_negz = alfrid.HDRLoader.parse(getAsset('rad_negz'))

		this._textureRad = new alfrid.GLCubeTexture([rad_posx, rad_negx, rad_posy, rad_negy, rad_posz, rad_negz]);

		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));
	}


	_initViews() {
		// this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		// this._bBall = new alfrid.BatchBall();
		// this._bSkybox = new alfrid.BatchSkybox();
		this._vModel = new ViewObjModel();
	}


	_onKey(e) {
		console.log(e.keyCode);

		if(e.keyCode === 32) {//	space
			this._vModel.addDrop(this.camera.position);
		}
	}

	render() {
		GL.clear(0, 0, 0, 0);
		// this._bSkybox.draw(this._textureRad);

		this._vModel.render(this._textureRad, this._textureIrr, this._textureAO);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;