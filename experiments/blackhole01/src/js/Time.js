// Time.js

import Config from './Config';

class Time {
	constructor() {
		const _fps = Config.targetFps;
		const speedRatio = 60 / _fps;
		this._value = 0;
		this.speed = 0.01 * speedRatio;

		this._isRunning = true;

		this.frame = 0;
	}

	pause() {
		this._isRunning = false;
	}

	resume() {
		this._isRunning = true;
	}

	tick() {
		this.frame++;
		this._value += this.speed;
	}


	get current() {
		return this._value;
	}
}


const _instance = new Time();

export default _instance;