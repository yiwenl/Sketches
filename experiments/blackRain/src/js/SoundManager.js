// SoundManager.js
import { EventDispatcher, Scheduler } from 'alfrid';
import Sono from 'sono';
import SoundCloudBadge from './SoundCloudBadge';

let instance;

const prec = function(mValue, mPrec = 2) {
	const t = Math.pow(10, mPrec);
	return Math.floor(mValue * t) / t;
}

// time, beat , lifeDecrease
// 140 			decrease more 
// 170
// 190 0.5
// 240

const defaultFreq = 1700;

class SoundManager extends EventDispatcher {
	constructor() {
		super();
		let id = Math.floor(Math.random() * 0xFF);
		console.log('SoundManager : ', id);

		this._hasSoundLoaded = false;
		this._min = 99999;
		this._max = -175.7;

		this._preSum = 0;
		this._hasBeat = false;

		this._init();
	} 


	_init() {
		// let song = 'https://soundcloud.com/karmafields/karma-fields-sweat?in=karmafields/sets/karma-fields-sweat';
		// let song = 'https://soundcloud.com/user18081971/katiacid';
		// let song = 'https://soundcloud.com/richarddjames/piano-un10-it-happened';
		// let song = 'https://soundcloud.com/mysterylandmusic/unsubscribe_penultimate';
		// let song = 'https://soundcloud.com/dee-san/oscillate-01';

		const useLocal = true;

		if(useLocal) {
			let src = './assets/audio/InsomniacOlympics.mp3';
			this.sound = Sono.load({
				url: [src],
				volume: 1.01,
				loop: true,
				onComplete: (sound) => {
					this._onSoundLoaded(sound);
				}
			});
		} else {
			let song = 'https://soundcloud.com/qrvaelet/blockhead-insomniac-olympics';

			SoundCloudBadge({
				client_id: 'e8b7a335a5321247b38da4ccc07b07a2',
				song: song
			}, (err, src, json) => this._onSound(err, src, json));
		}

		


		this.canvas = document.createElement("canvas");
		
		this.ctx = this.canvas.getContext('2d');
		const size = 256;
		this.canvas.width = size;
		this.canvas.height = size;
		this.canvas.className = 'debug-canvas';

		this.counter = document.createElement("p");
		this.counter.className = 'debug-counter';

		this._addCanvas();
	}


	_addCanvas() {
		if(!document.body) {
			Scheduler.next(()=>this._addCanvas());
			return;
		}

		document.body.appendChild(this.canvas);
		document.body.appendChild(this.counter);
	}


	_onSound(err, src, json) {
		if(err) {
			console.warn(err);
		}
		console.log('On Sound :', src);

		this.sound = Sono.load({
			url: [src],
			volume: 1,
			loop: true,
			onComplete: (sound) => {
				this._onSoundLoaded(sound);
			}
		});
	}

	_onSoundLoaded(sound) {
		console.debug("Sound Loaded", this);
		// this.sound.volume = 0;
		this.analyser = sound.effect.analyser(128);
		sound.play();
		this._hasSoundLoaded = true;
		this._inLowPass = false;

		this._lowpass = sound.effect.lowpass();

		// this._lowpass.Q.value = 1;
		this._lowpass.frequency.value = defaultFreq;

		Scheduler.addEF(()=>this._update());
	}


	_update() {
		this.counter.innerHTML = prec(this.sound.currentTime);

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if(this._hasBeat) {
			this.ctx.fillStyle = 'red';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this._hasBeat = false;
		}

		const f = this.analyser.getFrequencies();
		const total = f.length/2;
		let sum = 0;
		const ctx = this.ctx;

		const drawBar = function(x, height) {
			const colour = `rgba(${height}, ${height}, ${height}, 1)`;
			ctx.fillStyle = colour;
			ctx.fillRect(x, 0, 2, height/2);
		}

		for(let i=0; i<total; i++) {
			const freq = f[i];
			drawBar(i*2, freq);
			sum += freq;
		}

		const gap = params.minBeatDiff;
		sum /= total;
		const diff = sum - this._preSum;
		if(sum - this._preSum > gap) {
			this._hasBeat = true;
		}

		this._preSum = sum;

		if(sum > this._max) {
			this._max = sum;
			// console.log('Max :', this._max);
		}
	}

	getData() {
		return {
			sum: this._preSum,
			sumPerc: this._preSum/params.maxSum,
			hasBeat: this._hasBeat
		}
	}

	toggle() {
		this._inLowPass = !this._inLowPass;
		this._lowpass.frequency.value = this._inLowPass ? 300 : defaultFreq;
		this._lowpass.Q.value = this._inLowPass ? 0.2 : 1;
	}

	get hasSoundLoaded() {	return this._hasSoundLoaded;	}
	get currentTime() {	return this.sound.currentTime; }
}


SoundManager.getInstance = function() {
	if(!instance) {
		instance = new SoundManager();
	}

	return instance;
}

export default SoundManager.getInstance();