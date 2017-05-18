// PassBlur.js

import PassVBlur from './PassVBlur';
import PassHBlur from './PassHBlur';
import PassMacro from './PassMacro';

class PassBlur extends PassMacro {
	constructor(mQuality = 9, mWidth, mHeight, mParams) {
		super();
		const vBlur = new PassVBlur(mQuality, mWidth, mHeight, mParams);
		const hBlur = new PassHBlur(mQuality, mWidth, mHeight, mParams);

		this.addPass(vBlur);
		this.addPass(hBlur);
	}
}

export default PassBlur;
