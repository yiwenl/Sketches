// RainDrop.js

import alfrid from 'alfrid';
var random = function(min, max) { return min + Math.random() * (max - min);	}

class RainDrop extends alfrid.EventDispatcher {

	constructor() {
		super();
		this._position = vec3.create();
		this._velocity = vec3.create();

		this.reset();
		this.activated = false;
		this._hasTriggered = false;
	}


	reset() {
		const { maxRadius, terrainSize, numRainDrops, numCubes } = params;
		const r = terrainSize * 0.3;
		this._hasTriggered = false;

		this._cubes     = [];
		this._positions = [];
		this._extras    = [];

		const vr = .1;
		this._velocity = vec3.fromValues(random(-vr, vr), random(-.5, -1), random(-vr, vr));
		vec3.scale(this._velocity, this._velocity, .25);
		this._position = vec3.fromValues(random(-r, r), maxRadius + random(0, -1), random(-r, r));
		

		const num = numCubes / numRainDrops;
		for(let i=0; i<num; i++) {
			this._positions.push([0, 0, 0]);
			this._extras.push([0, 0, 0]);
		}

	}

	update() {
		if(params.speedOffset.value <= 0.1) {
			return;
		}
		const pos = this._positions.pop();
		let extra = this._extras.pop();

		vec3.copy(pos, this._position);
		const scale = random(.025, .05);
		const rx = Math.random() * Math.PI * 2.0;
		const ry = Math.random() * Math.PI * 2.0;
		extra = [rx, ry, scale];

		this._positions.unshift(pos);
		this._extras.unshift(extra);

		let v = vec3.clone(this._velocity);
		vec3.scale(v, v, params.speedOffset.value);


		vec3.add(this._position, this._position, v);

		if(this.hasHitGroud && !this._hasTriggered) {
			this._hasTriggered = true;
			this.trigger('onHitGround', this._positions[0]);

			alfrid.Scheduler.delay(()=> {
				this.reset();
				this.activated = false;
			}, null, 500);
		}
	}

	get hasHitGroud() {
		const { maxRadius } = params;
		const drop = this._positions[0];
		return drop[1] < -maxRadius;
	}

	get positions() {
		return this._positions;
	}

	get extras() {
		return this._extras;
	}

}


export default RainDrop;