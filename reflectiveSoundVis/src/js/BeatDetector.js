// BeatDetector.js
import alfrid from './libs/alfrid.js';

window.Sono = require('./libs/sono.min.js');


const NUM_SAMPLES = 256;
const ON_BEAT = 'onBeat';

class BeatDetector extends alfrid.EventDispatcher {
	constructor(url, beatCallback, isDebugging=false) {
		super();

		this._url = url;
		this._hasSoundLoaded = false;
		this._loadSound();
		this._sum = 0;
		this._beatCallback = beatCallback;
		this._easeSum = new alfrid.EaseNumber(0.0, .1);
		this._isDebugging = isDebugging;
		this.threshold = 100;


		//	DEBUG

		if(this._isDebugging) {
			this.canvas = document.createElement("canvas");
			this.ctx = this.canvas.getContext('2d');

			this.canvas.width = 200;
			this.canvas.height = 200;
			document.body.appendChild(this.canvas);
			this.canvas.style.position = 'absolute';
			this.canvas.style.left = '0px';	
			this.canvas.style.top = '0px';	
			this.canvas.style.zIndex = '999';	
		}
		
	}


	_loadSound() {
		this.sound = Sono.load({
		    url: this._url,
		    volume: 1.0,
		    loop: true,
		    onComplete: (sound) => this._onSoundLoaded(sound)
		});
	}


	_onSoundLoaded(sound) {
		
		this._hasSoundLoaded = true;
		this.analyser        = this.sound.effect.analyser(NUM_SAMPLES);
		this.frequencies     = this.analyser.getFrequencies();

		this.sound.play();

		alfrid.Scheduler.addEF(()=>this._loop());

	}


	_loop() {
		let f = this.analyser.getFrequencies();

		let sum = 0;
		for(let i=0; i<f.length; i++) {
			sum += f[i]
		}

		sum /= f.length;
		this._sum = sum/128;
		this.frequencies = f;

		if(sum > this._easeSum.value + this.threshold) {
			this._easeSum.setTo(sum);
			this._easeSum.value = 0;

			if(this._beatCallback) {
				this._beatCallback(sum/128);
			}
		}


		if(this._isDebugging) {
			this.ctx.clearRect(0, 0, 200, 200);
			let g = Math.floor(sum * 2.0);
			this.ctx.fillStyle = 'rgba('+g+', '+g+', '+g+', 255)';
			this.ctx.fillRect(0, 0, 100, 100);

			g = Math.floor(this._easeSum.value *2.0);
			this.ctx.fillStyle = 'rgba('+g+', '+g+', '+g+', 255)';
			this.ctx.fillRect(0, 100, 100, 100);
		}
	}


	get amplitude() 			{	return this._sum;	}
	get beatAmplitude() 		{	return this._easeSum.value/128; }
	get hasSoundLoaded() {	return this._hasSoundLoaded;	}
}

BeatDetector.ON_BEAT = ON_BEAT;


export default BeatDetector;