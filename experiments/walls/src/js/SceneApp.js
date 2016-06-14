// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewWalls from './ViewWalls';
import ViewFloor from './ViewFloor';
import Sono from './libs/sono.min';

import ViewFxaa from './ViewFxaa';
import ViewChroma from './ViewChroma';
import ViewSSAO from './ViewSSAO';
import ViewPost from './ViewPost';

// import EffectComposer from './effectComposer/EffectComposer';
// import PassFXAA from './effectComposer/passes/PassFXAA';
// import Pass from './effectComposer/Pass';
// import PassBlur from './effectComposer/passes/PassBlur';

import fsChroma from '../shaders/chroma.frag';

window.getAsset = function(id) {	return assets.find(a => a.id === id).file;	}

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this.steps = 0;
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = .3;
		this.orbitalControl.rx.limit(0, Math.PI/2);

		this._initSound();
		this.sums = [];
		this.time = 0;
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
		this._fboPost = new alfrid.FrameBuffer(GL.width, GL.height);
		const aoSize = 1024;
		this._fboSSAO = new alfrid.FrameBuffer(aoSize, aoSize);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vWalls = new ViewWalls();
		this._vFloor = new ViewFloor();
		this._vPost = new ViewPost();
		this._vFxaa = new ViewFxaa();
		this._vSSAO = new ViewSSAO();

		// this._composer = new EffectComposer();
		// this.passChroma = new Pass(fsChroma);
		// this.passChroma.uniform('resolution', 'vec2', [GL.width, GL.height]);
		// this._composer.addPass(this.passChroma);
		// this._composer.addPass(new PassFXAA());
	}


	_initSound() {
		this.soundOffset = 0;
		this.preSoundOffset = 0;
		this.sound = Sono.load({
		    url: ['assets/audio/03.mp3'],
		    volume: 0.01,
		    loop: false,
		    onComplete: (sound) => {
		    	this.analyser = sound.effect.analyser(128);
		    	sound.play();
		    	this.sound = sound;
		    }
		});
	}

	render() {
		if(!this.analyser) {	return;	}

		document.body.classList.remove('isLoading');
		this._getSoundData();
		GL.clear(0, 0, 0, 0);
		// this._bDots.draw();

		this._fboRender.bind();
		GL.clear(1, 1, 1, 1);
		this._vWalls.render(this._textureRad, this._textureIrr);
		// this._vFloor.render(this._textureRad, this._textureIrr);
		this._fboRender.unbind();

		this._fboSSAO.bind();
		GL.clear(0, 0, 0, 0);
		this._vSSAO.render(this._fboRender.getDepthTexture());
		this._fboSSAO.unbind();

		this._fboPost.bind();
		GL.clear(0, 0, 0, 0);
		this._vPost.render(this._fboRender.getTexture(), this._fboSSAO.getTexture());
		this._fboPost.unbind();

		this._vFxaa.render(this._fboPost.getTexture());
		// this._bCopy.draw(this._fboPost.getTexture());
	}

	_getSoundData() {
		// console.log(this.sound.currentTime, this.sound.duration);
		if(this.sound.currentTime === this.sound.duration) return;
		this.steps ++;
		this.frequencies = this.analyser.getFrequencies();
		let f = this.analyser.getFrequencies();

		let sum = 0;
		let num = f.length/2;

		for(let i=0; i<num; i++) {
			sum += f[i];
		}

		sum /= num;
		this.sum = sum;

		if(this.steps % 3 === 0) {
			// this._vWalls.addWall(sum);
		}
		

		// this.sums.push(sum);
		// console.log(this.sums.length);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboPost = new alfrid.FrameBuffer(GL.width, GL.height);
	}
}


export default SceneApp;