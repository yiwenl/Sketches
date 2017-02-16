// HDRLoader.js

'use strict';

import BinaryLoader from './BinaryLoader';
import hdrParser from '../utils/HDRParser';

class HDRLoader extends BinaryLoader {
	constructor() {
		super(true);
	}

	parse(mArrayBuffer) {
		return hdrParser(mArrayBuffer);
	}

	_onLoaded() {
		const o = this.parse(this._req.response);
		if(this._callback) {
			this._callback(o);
		}
	}

}


HDRLoader.parse = function (mArrayBuffer) {
	return hdrParser(mArrayBuffer);
};

export default HDRLoader;