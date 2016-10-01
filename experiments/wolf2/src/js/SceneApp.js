// SceneApp.js

import alfrid, { Scene, GL, GLTexture } from 'alfrid';
import ViewWolf from './ViewWolf';
import ViewGrass from './ViewGrass';
import ViewNoise from './ViewNoise';
import ViewFloor from './ViewFloor';
import ViewDome from './ViewDome';
import ViewClouds from './ViewClouds';
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
		this.orbitalControl.rx.value = .25;
		this.orbitalControl.rx.limit(.2, .3);
		this.orbitalControl.ry.value = Math.PI - 0.1;
		this.orbitalControl.lockZoom(true);

		const yOffset = 0;
		this.orbitalControl.center[1] = yOffset + 1;
		this.orbitalControl.positionOffset[1] = yOffset;
		this._isDay = true;
		this._lightIntensity = new alfrid.EaseNumber(1, 0.01);

		window.addEventListener('keydown', (e)=>this._onKey(e));
		window.addEventListener('touchstart', (e)=>{
			this.switch();
			this._onDown(e);
		});
		window.addEventListener('mousedown', (e)=>this._onDown(e));
	}

	_onDown(e) {
		this.orbitalControl.ry.easing = .05;
	}

	_onKey(e) {
		if(e.keyCode === 32) {	this.switch();	}
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

		if(!GL.isMobile) {
			const noiseSize  	= 64;
			this._fboNoise  	= new alfrid.FrameBuffer(noiseSize, noiseSize, {type:GL.UNSIGNED_BYTE}, true);	
		}
		

		this._textureDay = new alfrid.GLTexture(getAsset('day'));	
		this._textureNight = new alfrid.GLTexture(getAsset('night'));	
	}


	_initViews() {
		this._vWolf = new ViewWolf();
		this._vGrass = new ViewGrass();
		this._vDome = new ViewDome();
		this._vFloor = new ViewFloor();
		this._vClouds = new ViewClouds();
		if(!GL.isMobile) {
			this._vNoise = new ViewNoise();	
		}
	}

	switch() {
		this._isDay = !this._isDay;
		this._vDome.switch(this.camera.position);
		this.orbitalControl.ry.easing = 0.01;
		this.orbitalControl.ry.value += Math.PI;
		this._lightIntensity.value = this._isDay ? 1 : .5;
		this._vClouds.opacity.easing = this._isDay ? 'expIn' : 'expOut';
		this._vClouds.opacity.value = this._isDay ? 1 : 0;
	}

	render() {
		params.time += params.speed;
		GL.clear(0, 0, 0, 0);

		const wolfUV = this._vWolf.uvOffset;
		let textureHeight, textureNormal;
		if(GL.isMobile) {
			textureHeight = GLTexture.greyTexture();
			textureNormal = GLTexture.greyTexture();
		} else {
			this._fboNoise.bind();
			GL.clear(0, 0, 0, 0);
			this._vNoise.render();
			this._fboNoise.unbind();
			
			textureHeight = this._fboNoise.getTexture(0);
			textureNormal = this._fboNoise.getTexture(1);
		}

		if(this._isDay) {
			this._vDome.render(this._textureDay, this._textureNight);	
		} else {
			this._vDome.render(this._textureNight, this._textureDay);
		}

		
		
		
		GL.disable(GL.CULL_FACE);
		this._vClouds.render();
		this._vGrass.render(textureHeight, textureNormal, wolfUV, this._lightIntensity.value);
		GL.enable(GL.CULL_FACE);
		this._vFloor.render(textureHeight, textureNormal, wolfUV, this._lightIntensity.value);

		this._vWolf.render(this._textureRad, this._textureIrr, -.5, textureHeight, this._lightIntensity.value);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;