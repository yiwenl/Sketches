// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewTerrain from './ViewTerrain';



class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 200);
		this.orbitalControl.radius.value = 30;
		this.orbitalControl.rx.value = 0.9;
		this.orbitalControl.ry.value = 0.3;
		this.resize();
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};

		this._particleSets = [];
		for(let i=0; i<params.numSets; i++) {
			const fboCurrent      = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
			const fboTarget       = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
			const oSet = {fboCurrent, fboTarget, count:i};			
			console.log(oSet);
			this._particleSets.push(oSet);
		}

		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'));
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'));
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'));
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'));
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'));
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'));

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);
		this._textureRad = alfrid.GLCubeTexture.parseDDS(getAsset('radiance'));

		// this._fboCurrent      = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		// this._fboTarget       = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._textureHeight   = new alfrid.GLTexture(getAsset('heightmap'));
		this._textureNormal   = new alfrid.GLTexture(getAsset('normalmap'));
		this._textureGradient = new alfrid.GLTexture(getAsset('gradient'));
		this._textureBg       = new alfrid.GLTexture(getAsset('bg'));
		this._textureNoise    = new alfrid.GLTexture(getAsset('noise'));
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bSkybox = new alfrid.BatchSkybox(params.terrainSize);


		//	views
		this._vTerrain = new ViewTerrain();
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		for(let i=0; i<params.numSets; i++) {
			this._vSave.reset();
			let { fboTarget, fboCurrent } = this._particleSets[i];
			fboCurrent.bind();
			GL.clear(0, 0, 0, 0);
			this._vSave.render();
			fboCurrent.unbind();

			fboTarget.bind();
			GL.clear(0, 0, 0, 0);
			this._vSave.render();
			fboTarget.unbind();	
		}
		

		GL.setMatrices(this.camera);
	}


	updateFbo(o) {

		let { fboTarget, fboCurrent } = o;
		fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			fboCurrent.getTexture(1), 
			fboCurrent.getTexture(0), 
			fboCurrent.getTexture(2), 
			this._textureHeight);
		fboTarget.unbind();


		let tmp     = o.fboCurrent;
		o.fboCurrent = o.fboTarget;
		o.fboTarget  = tmp;
	}


	render() {

		for(let i=0; i<this._particleSets.length; i++) {
			let oSet = this._particleSets[i];
			oSet.count ++;

			if(oSet.count % params.skipCount == 0) {
				oSet.count = 0;
				this.updateFbo(oSet);
			}
		}

		// this._count ++;
		// if(this._count % params.skipCount == 0) {
		// 	this._count = 0;
		// 	this.updateFbo();
		// }

		// let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);
		this._bSkybox.draw(this._textureIrr);

		if(params.renderTerrain) {
			this._vTerrain.render(this._textureHeight, this._textureNormal, this._textureRad, this._textureIrr, this._textureNoise);
		}
		
		for(let i=0; i<this._particleSets.length; i++) {
			let oSet = this._particleSets[i];
			let p = oSet.count / params.skipCount;
			let { fboTarget, fboCurrent } = oSet;

			this._vRender.render(fboTarget.getTexture(0), fboCurrent.getTexture(0), p, fboCurrent.getTexture(2), fboTarget.getTexture(3), this._textureNormal, this._textureGradient, this._textureRad, this._textureIrr);
		}
		

		// const size = Math.min(params.numParticles, GL.height/4);

		// for(let i=0; i<4; i++) {
		// 	GL.viewport(0, size * i, size, size);
		// 	this._bCopy.draw(this._particleSets[0].fboCurrent.getTexture(i));
		// }

	}


	resize() {
		console.debug('resize');
		const scale = 1.;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;