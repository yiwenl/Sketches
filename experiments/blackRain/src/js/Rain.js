// Rain.js

import RainDrop from './RainDrop';
import alfrid from 'alfrid';

class Rain extends alfrid.EventDispatcher {

	constructor() {
		super();
		this._positions = [];
		this._extras = [];
		this._init();
	}

	_init() {
		const { numRainDrops } = params;
		this._drops = [];

		for(let i=0; i<numRainDrops; i++) {
			const drop = new RainDrop();
			drop.on('onHitGround', (pos)=> {
				this.trigger('onHitGround', pos.detail);
			});
			this._drops.push(drop);
		}
	}


	addRainDrop() {
		if(params.hasPaused) {
			return;
		}
		const drop = this._drops.pop();
		drop.reset();
		drop.activated = true;

		this._drops.unshift(drop);
	}


	update() {
		this._positions = [];
		this._extras = [];
		let count = 0;

		for(let i=0; i<this._drops.length; i++) {
			const drop = this._drops[i];
			if(drop.activated) {
				drop.update();
				count ++;
			}


			this._positions = this._positions.concat(drop.positions);
			this._extras = this._extras.concat(drop.extras);
		}

	}


	get positions() {
		return this._positions;
	}


	get extras() {
		return this._extras;
	}

}


export default Rain;