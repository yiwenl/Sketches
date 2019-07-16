// FboPingPong.js

import alfrid from 'alfrid';
import FboFarray from './FboArray';

class FboPingPong extends FboFarray{
	constructor(width, height, params={}, mNumTargets=1) {
		super(2, width, height, params, mNumTargets)
	}
}

export default FboPingPong;