// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewWolf from './ViewWolf';
import ViewGrass from './ViewGrass';
import ViewNoise from './ViewNoise';
import ViewDebug from './ViewDebug';
import ViewDebugDots from './ViewDebugDots';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		const RAD = Math.PI / 180;

		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 200);
		this.orbitalControl.radius.value = 50;
		this.orbitalControl.rx.value = .3;
		// this.orbitalControl.rx.limit(0.2, 0.4);
		// this.orbitalControl.ry.value = Math.PI- 0.3;

		const yOffset = 0;
		this.orbitalControl.center[1] = yOffset + 1;
		this.orbitalControl.positionOffset[1] = yOffset;
		this.hit = [0, 0, 0];
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

		this._textureGrass = new alfrid.GLTexture(getAsset('grass'));
		const noiseSize  	= 64;
		this._fboNoise  	= new alfrid.FrameBuffer(noiseSize, noiseSize, {type:GL.UNSIGNED_BYTE});
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();
		// this._bSkybox = new alfrid.BatchSkybox();

		this._vWolf = new ViewWolf();
		this._vGrass = new ViewGrass();
		this._vNoise = new ViewNoise();

		this._vDebug = new ViewDebug();
		this._vDots = new ViewDebugDots();
	}


	render() {
		params.time += params.speed;
		GL.clear(0, 0, 0, 0);

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render();
		this._fboNoise.unbind();

		this._vDebug.render(this._fboNoise.getTexture());
		this._vDots.render(this._fboNoise.getTexture());

		// GL.disable(GL.CULL_FACE);
		// this._vGrass.render(this.hit, this._textureGrass, this._fboNoise.getTexture(), this._fboNoise.getTexture());
		// GL.enable(GL.CULL_FACE);

		// this._vWolf.render(this._textureRad, this._textureIrr, 0.0);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;