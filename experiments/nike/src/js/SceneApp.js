// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewCrystals from './ViewCrystals';
import Scheduler from 'scheduling';

window.getAsset = function (id) {
	for(var i = 0; i < assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
};

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		const RAD = Math.PI/180;
		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 50);
		this.orbitalControl.radius.value = 3;
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
	}


	_initViews() {
		// this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		// this._bBall = new alfrid.BatchBall();
		// this._bSkybox = new alfrid.BatchSkybox();
		this._vModel = new ViewObjModel();

		const strObj = getAsset('objCrystal');
		this.meshCrystal = alfrid.ObjLoader.parse(strObj);

		this._crystals = [];
		const NUM = 50;

		for(let i=0; i<NUM; i++) {
			if(i === 0) {
				const c = new ViewCrystals(i, NUM, this._vModel.mesh, this.meshCrystal);
				this._crystals.push(c);	
			} else {
				Scheduler.defer( () => {
					this._createCrystals(i, NUM);
				})
			}
		}
	}


	_createCrystals(i, num) {
		console.log('Create crystal :', i, num);
		const c = new ViewCrystals(i, num, this._vModel.mesh, this.meshCrystal);
		this._crystals.push(c);	
	}


	render() {
		params.time += 0.01;
		GL.clear(0, 0, 0, 0);

		this._vModel.render(this._textureRad, this._textureIrr, this._textureAO);

		const shader = this._crystals[0].shader;

		this._crystals.map((crystal)=> {
			crystal.render(this._textureRad, this._textureIrr, alfrid.GLTexture.whiteTexture(), shader);
			return null;
		});
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;