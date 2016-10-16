// PassBlur.js

import Pass from './effectComposer/Pass';

import fs from '../shaders/blur.frag';

class PassBlur extends Pass {
	constructor() {
		super(fs);
	}
}

export default PassBlur;