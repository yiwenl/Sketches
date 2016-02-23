// Cluster.js

import alfrid from './libs/alfrid.js';

class Cluster {
	constructor(position, strength) {
		console.log(position, strength);
		this._position = position;
		this._strength = new alfrid.EaseNumber(0, .1);
		this._strength.value = strength;
	}

	update(position, mStrength) {
		this._position = position;
		this._strength.value = mStrength;
	}

	distance(position) {
		let x = position[0] - this._position[0];
		let y = position[1] - this._position[1];
		let z = position[2] - this._position[2];

		return Math.sqrt(x*x + y*y + z*z);
	}


	get position() {
		return this._position;
	}

	get isDead() {
		return this._strength.value < .3;
	}
}


export default Cluster;