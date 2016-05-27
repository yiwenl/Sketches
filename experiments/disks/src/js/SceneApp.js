// SceneApp.js

import alfrid, { Scene, GLTexture, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewDisks from './ViewDisks';
import ViewAO from './ViewAO';

window.getAsset = function (id) {
	for(var i = 0; i < assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
};

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		const RAD = Math.PI/180;
		this.camera.setPerspective(65 * RAD, GL.aspectRatio, .1, 100);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = .3;
		this.orbitalControl.radius.value = 50;

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

		const shadowMapSize = 1024;
		this._fboRender = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();

		// this._vModel = new ViewObjModel();
		// this._vDisks = new ViewDisks();
		// this._vDisksOutter = new ViewDisks(7);
		this._vAO = new ViewAO();
		const numSphere = 20;
		this._spheres = [];

		for(let i=0; i<numSphere; i++) {
			let sphere = new ViewDisks(i+5);
			this._spheres.push(sphere);
		}
	}


	render() {
		this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._spheres.map((s)=>{
			s.render(this._textureRad, this._textureIrr, GLTexture.whiteTexture());
		});
		this._fboRender.unbind();
		// this._bCopy.draw(this._fboRender.getDepthTexture());

		this._vAO.render(this._fboRender.getTexture(), this._fboRender.getDepthTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;