// Cluster.js

import alfrid from './libs/alfrid.js';

class Cluster {
	constructor(position, strength) {
		this._position = position;
		this.easing = .05;
		this._strength = new alfrid.EaseNumber(0, this.easing);
		this._life = new alfrid.EaseNumber(1, this.easing);
		this._strength.value = strength;
	}

	update(position, mStrength) {
		// this._position = position;

		this._position[0] += (position[0] - this._position[0]) * this.easing;
		this._position[1] += (position[1] - this._position[1]) * this.easing;
		this._position[2] += (position[2] - this._position[2]) * this.easing;
		this._strength.value = mStrength;
		this._life.value = 1;
	}

	setStrength(mStrength) {
		this._strength.value = mStrength;
		this._life.value = 0;
	}

	distance(position) {
		if( this.isNearDead) {
			return 999;
		}
		let x = position[0] - this._position[0];
		let y = position[1] - this._position[1];
		let z = position[2] - this._position[2];

		return Math.sqrt(x*x + y*y + z*z);
	}


	get position() {
		return this._position;
	}

	get strength() {
		return this._strength.value * this._life.value;
	}

	get isNearDead() {
		return this._life.value < .25;
	}

	get isDead() {
		return this._life.value < .1;
	}
}


export default Cluster;