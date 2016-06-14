// PassVBlur.js

import { GL } from 'alfrid';
import PassBlurBase from './PassBlurBase';
const fsBlur5 = require('../shaders/blur5.frag');
const fsBlur9 = require('../shaders/blur9.frag');
const fsBlur13 = require('../shaders/blur13.frag');

class PassVBlur extends PassBlurBase {
	constructor(mQuality = 9, mWidth, mHeight, mParams) {
		super(mQuality, [0, 1], mWidth, mHeight, mParams);
	}
}

export default PassVBlur;

