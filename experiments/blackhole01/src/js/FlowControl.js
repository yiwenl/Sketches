// FlowControl.js

import TweenNumber from './utils/TweenNumber';
import Time from './Time';
import Config from './Config';

const delaySimulationStart = 5;

// const targetFps = 30;


class FlowControl {

	constructor() {
	}

	init() {
		this.FPS = Config.fps;
		const { targetFps } = Config;

		const totalFrames = 2 * 60 * targetFps;
		console.log('totalFrames', totalFrames, targetFps);

		this.totalFrames = totalFrames;
		this.speedRatio = 60 / targetFps;

		console.log('this.speedRatio', this.speedRatio);

		this._bgOpeningOffset = new TweenNumber(0, 'sineIn', 0.001 * this.speedRatio);
		this._speedOffset = new TweenNumber(0, 'circularOut', 0.005 * this.speedRatio);
		this.respwan = true;
		this._bloomStrength = new TweenNumber(0.25, 'expInOut', 0.01 * this.speedRatio);

		this._list = [
			this._bgOpeningOffset,
			this._speedOffset
		];


		this._isCrazy = false;

		window.addEventListener('keydown', (e) => {
			if(e.keyCode === 32 && Time.frame > 500 && !this._isCrazy) {
				this.accelerate();
			}
		});
	}


	start() {
		this.respwan = true;
		this._bloomStrength.setTo(0.25);
		this._speedOffset.setTo(0);
		this._bgOpeningOffset.easing = 'circularInOut';

		this._bgOpeningOffset.value = 1;
		// setTimeout(()=> {
			
		// }, 500);

		
	}

	playParticles() {
		console.log('Play particles');
		this._speedOffset.easing = 'circularOut';
		this._speedOffset.value = 1;
	}


	accelerate() {
		this._isCrazy = true;
		console.log('Speed UP !');
		this._speedOffset.speed = 0.01 * this.speedRatio;
		this._speedOffset.easing = 'circularIn';
		this._speedOffset.value = 2;
		this._bloomStrength.value = 2;

		setTimeout(()=> {
			this._speedOffset.speed = 0.01 * this.speedRatio;
			this._speedOffset.easing = 'sineOut';
			this._speedOffset.value = 1;
			this._bloomStrength.value = 1;
		}, 5000);

		setTimeout(()=> {
			this._isCrazy = false;
		}, 6000);
	}


	end() {
		console.log('End');
		this._speedOffset.speed = 0.01 * this.speedRatio;
		this._speedOffset.easing = 'circularIn';
		this._speedOffset.value = 2;
		this._bloomStrength.value = 2;

		// const delayToEnd = 4000;

		// setTimeout(()=> {
		// 	this.respwan = false;
		// }, delayToEnd);

		// setTimeout(()=>this.close(), delayToEnd + 4000);
	}


	close() {
		console.log('Close');
		this._bgOpeningOffset.speed = 0.01 * this.speedRatio;
		this._bgOpeningOffset.easing = 'circularInOut';
		this._bgOpeningOffset.value = 0;	
	}


	_updateAllNumbers() {
		this._list.forEach( n => n.update() );
	}


	update() {
		const _fps = 30;
		Config.progress = Math.floor(Time.frame / this.totalFrames * 1000) / 10;
		const frameParticleStart = 5 * _fps;

		const timeClose = 17;
		const frameEndStart = this.totalFrames - timeClose * _fps;
		const frameStopSpwan = this.totalFrames - Math.floor((timeClose - 1.8) * _fps);
		const frameCloseStart = this.totalFrames - Math.floor((timeClose - 12.6) * _fps);


		if(Time.frame === frameParticleStart) {
			this.playParticles();
		}


		if(Time.frame === frameEndStart) {
			this.end();
		}


		// if(Time.frame === frameStopSpwan) {
		// 	this.respwan = false;
		// 	console.log('Stop spwan particles');
		// }


		// if(Time.frame === frameCloseStart) {
		// 	this.close();
		// }
		// console.log('Current time :', Time.frame);
		this._updateAllNumbers()
	}


	// getter & setters

	get bgOpeningOffset() {
		return this._bgOpeningOffset.value;
	}

	get speedOffset() {
		return this._speedOffset.value;
	}

	get bloomStrength() {
		return ths._bloomStrength.value;
	}

}

const _instance = new FlowControl();

export default _instance;