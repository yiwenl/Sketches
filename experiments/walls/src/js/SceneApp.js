// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewWalls from './ViewWalls';
import ViewFloor from './ViewFloor';
import Sono from './libs/sono.min';

window.getAsset = function (id) {
	for(let i = 0; i < assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
};

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this.steps = 0;
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = .3;

		this._initSound();
		this.sums = [];
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
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vWalls = new ViewWalls();
		this._vFloor = new ViewFloor();
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
		if(!this.analyser) {
			return;
		}

		document.body.classList.remove('isLoading');
		this._getSoundData();
		GL.clear(0, 0, 0, 0);
		// this._bSkybox.draw(this._textureRad);
		// this._bAxis.draw();
		this._bDots.draw();
		this._vWalls.render(this._textureRad, this._textureIrr);
		this._vFloor.render(this._textureRad, this._textureIrr);
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
		

		// console.log(sum);
		this.sums.push(sum);
		console.log(this.sums.length);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;