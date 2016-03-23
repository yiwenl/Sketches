// SceneApp.js
import alfrid from 'alfrid';
import ViewCube from './ViewCube';
// import sono from './libs/sono.min';

const sono = require('./libs/sono.min');

let GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		GL = alfrid.GL;
		GL.enableAlphaBlending();
		super();

		this._initSound();
		this._data = [];
		this._radius = 0.2;
		this._theta = 0.0;
		this.lightPosition = [1, 1, 1.5];
		this._frame = 0;

		this.orbitalControl.rx.value = .5;
		this.orbitalControl.ry.value = -.3;
	}


	_initTextures() {
		console.log('Init textures');
	}
	

	_initViews() {
		console.log('Init Views');

		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vCube = new ViewCube();
	}

	_initSound() {
		this.sound = sono.load({
			url: ['assets/02.mp3'],
			loop: false,
			onComplete: () => this._onSoundLoaded()
		})
	}


	_onSoundLoaded(sound) {
		console.log('Sound Loaded :', this.sound);
		this.sound.play();

		window.gui.add(this.sound, 'volume', 0, 1).listen();
		this.analyser = this.sound.effect.analyser(256);
	}


	render() {
		//	HELPERS
		this._bAxis.draw();
		this._bDots.draw();

		if(!this.analyser) {
			return;
		}

		if(this._frame++ % 10 == 0) { 
			this._getSoundData();
		}
		

		for(let i=0; i<this._data.length; i++) {
			const o = this._data[i];
			this._vCube.render(o.radius, o.theta, o.sum, this.lightPosition);
		}
		// this._vCube.render(this._radius * 0.0, this._theta, this.lightPosition);
	}


	_getSoundData() {
		var f = this.analyser.getFrequencies();

		const l = f.length /2;
		let sum = 0;
		for(let i=0; i<l; i++) {
			sum += f[i];
		}

		sum /= l;


		const BLOCK_SIZE = 0.05;
		
		let numBlocks = Math.PI * 2 * this._radius / BLOCK_SIZE;
		let angleIncrease = Math.PI * 2 / numBlocks;
		this._theta += angleIncrease;
		this._radius += BLOCK_SIZE/numBlocks;
		
		this._data.push({sum:sum * .001, theta:this._theta, radius:this._radius});
		// console.log(this._data[this._data.length-1]);
		if(Math.random() > .99) console.log(this._data.length);
	}
}


export default SceneApp;