import { GL } from 'alfrid';
import Pass from '../Pass';
const fsBlur5 = require('../shaders/blur5.frag');
const fsBlur9 = require('../shaders/blur9.frag');
const fsBlur13 = require('../shaders/blur13.frag');

class PassBlurBase extends Pass {
	constructor(mQuality = 9, mDirection, mWidth, mHeight, mParams = {}) {
		let fs;
		switch(mQuality) {
		case 5:
		default:
			fs = fsBlur5;
			break;
		case 9 : 
			fs = fsBlur9;
			break;
		case 13 : 
			fs = fsBlur13;
			break;

		}
		super(fs, mWidth, mHeight, mParams);
		this.uniform('uDirection', 'vec2', mDirection);
		this.uniform('uResolution', 'vec2', [GL.width, GL.height]);
	}
}

export default PassBlurBase;
