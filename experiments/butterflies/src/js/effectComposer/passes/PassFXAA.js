// PassFXAA.js

import { GL } from 'alfrid';
import Pass from '../Pass';
const fsFXAA = require('../shaders/fxaa.frag');

class PassFXAA extends Pass {
	constructor() {
		super(fsFXAA);
		this.uniform('uWidth', 'float', GL.width);
		this.uniform('uHeight', 'float', GL.height);
	}
}

export default PassFXAA;
