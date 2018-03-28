// PassHBlur.js

import PassBlurBase from './PassBlurBase';

class PassHBlur extends PassBlurBase {
	constructor(mQuality = 9, mWidth, mHeight, mParams) {
		super(mQuality, [1, 0], mWidth, mHeight, mParams);
	}
}

export default PassHBlur;
