// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewWolf from './ViewWolf';
import ViewGrass from './ViewGrass';
import ViewNoise from './ViewNoise';
import ViewFloor from './ViewFloor';
import ViewDome from './ViewDome';
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
		this.orbitalControl.radius.value = 17;
		this.orbitalControl.rx.value = .3;
		this.orbitalControl.ry.value = Math.PI - 0.1;

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
		this._fboNoise  	= new alfrid.FrameBuffer(noiseSize, noiseSize, {type:GL.UNSIGNED_BYTE}, true);

		this._textureDay = new alfrid.GLTexture(getAsset('day'));	
		this._textureNight = new alfrid.GLTexture(getAsset('night'));	
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();
		// this._bSkybox = new alfrid.BatchSkybox();

		this._vWolf = new ViewWolf();
		this._vGrass = new ViewGrass();
		this._vNoise = new ViewNoise();
		this._vDome = new ViewDome();

		this._vFloor = new ViewFloor();
		// this._vDots = new ViewDebugDots();
	}


	render() {
		params.time += params.speed;
		GL.clear(0, 0, 0, 0);

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render();
		this._fboNoise.unbind();

		const textureHeight = this._fboNoise.getTexture(0);
		const textureNormal = this._fboNoise.getTexture(1);

		this._vDome.render(this._textureDay, this._textureNight);
		this._vFloor.render(textureHeight, textureNormal);
		GL.disable(GL.CULL_FACE);
		this._vGrass.render(textureHeight, textureNormal);
		GL.enable(GL.CULL_FACE);

		this._vWolf.render(this._textureRad, this._textureIrr, -.5, textureHeight);

		// const size = 200;
		// for(let i=0; i<4; i++) {
		// 	GL.viewport(i *size, 0, size, size); 
		// 	this._bCopy.draw(this._fboNoise.getTexture(i));
		// }
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;