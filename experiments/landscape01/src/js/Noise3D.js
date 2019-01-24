// Noise3D.js

import Noise3DTexture from './Noise3DTexture';
import Config from './Config';

class Noise3D {
	constructor(mNum = 8.0, mNoiseScale = 1.0) {
		this._seed = Math.random() * 0xFF;
		this.speed = 0.03;

		const a = new Noise3DTexture(mNum, mNoiseScale);
		const b = new Noise3DTexture(mNum, mNoiseScale);

		a.render(this._seed);
		this._seed += this.speed * Config.fogMovingSpeed;
		b.render(this._seed);
		this._noises = [a, b];
	}


	update() {
		this.swap();
		this._seed += this.speed * Config.fogMovingSpeed;
		this.noise1.render(this._seed);
	}


	swap() {
		this._noises = this._noises.reverse();
	}


	get noise0() {
		return this._noises[0];
	}

	get noise1() {
		return this._noises[1];
	}


	get texture0() {
		return this._noises[0].getTexture()
	}

	get texture1() {
		return this._noises[1].getTexture()
	}
}

export default Noise3D;