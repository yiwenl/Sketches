// PassGreyscale.js

// PassFXAA.js

import Pass from '../Pass';
const fsGreyscale = require('../shaders/greyscale.frag');

class PassFXAA extends Pass {
	constructor() {
		super(fsGreyscale);
		this._saturation = 0;
	}


	get saturation() {
		return this._saturation;
	}


	set saturation(mValue) {
		this._saturation = mValue;
		this.uniform('uSaturation', 'float', this._saturation);
	}
}

export default PassFXAA;
