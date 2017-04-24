// PassVBlur.js

import PassBlurBase from './PassBlurBase';

class PassVBlur extends PassBlurBase {
	constructor(mQuality = 9, mWidth, mHeight, mParams) {
		super(mQuality, [0, 1], mWidth, mHeight, mParams);
	}
}

export default PassVBlur;

