// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewLightSphere from './ViewLightSphere';
import ViewShell from './ViewShell';
import EffectComposer from './post/EffectComposer';
import Pass from './post/Pass';
import PassBlur from './post/Passes/PassBlur';

import fsCut from '../shaders/cut.frag';
import fsGodRay from '../shaders/godray.frag';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		GL.disable(GL.DEPTH_TEST);
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

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._composer = new EffectComposer(512, 512);
		const passCut = new Pass(fsCut);
		const blurSize = Math.min(Math.min(GL.width, GL.height), 1024);
		const passBlur = new PassBlur(9);
		const passGodray = new Pass(fsGodRay);

		this.decrease = 0.935;
		this.scale = 0.98;
		gui.add(this, 'decrease', 0.85, 1.0).onChange(() => {
			passGodray.uniform("uDecrease", "float", this.decrease);
		});

		gui.add(this, 'scale', .85, 1.0).onChange(() => {
			passGodray.uniform("uScale", "float", this.scale);
		});

		passGodray.uniform("uDecrease", "float", this.decrease);
		passGodray.uniform("uScale", "float", this.scale);

		this._composer.addPass(passCut);
		this._composer.addPass(passBlur);
		this._composer.addPass(passGodray);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();
		// this._vModel = new ViewObjModel();

		this._vLight = new ViewLightSphere();
		this._vShell = new ViewShell();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vLight.render();
		this._vShell.render(this._textureRad, this._textureIrr);
		this._fboRender.unbind();

		//	post
		this._composer.render(this._fboRender.getTexture());

		
		GL.enableAdditiveBlending();
		this._bCopy.draw(this._fboRender.getTexture());
		this._bCopy.draw(this._composer.getTexture());
		// GL.enable(GL.DEPTH_TEST);
		GL.enableAlphaBlending();
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;