// PassHBlur.js

import { GL } from 'alfrid';
import PassBlurBase from './PassBlurBase';
const fsBlur5 = require('../shaders/blur5.frag');
const fsBlur9 = require('../shaders/blur9.frag');
const fsBlur13 = require('../shaders/blur13.frag');

class PassHBlur extends PassBlurBase {
	constructor(mQuality = 9, mWidth, mHeight, mParams) {
		super(mQuality, [1, 0], mWidth, mHeight, mParams);
	}
}

export default PassHBlur;
