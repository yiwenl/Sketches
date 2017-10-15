// getRandomRotation.js

import getRandomAxis from './getRandomAxis';

const { PI } = Math;
var random = function(min, max) { return min + Math.random() * (max - min);	}

export default function(mAngle) {

	if(mAngle === undefined) {
		mAngle = random(-PI, PI);
	}

	const v = getRandomAxis();
	const q = quat.create();
	quat.setAxisAngle(q, v, mAngle);

	return q;
}