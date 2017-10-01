// getRandomRotation.js

import getRandomAxis from './getRandomAxis';

const { PI } = Math;
var random = function(min, max) { return min + Math.random() * (max - min);	}

export default function() {
	const v = getRandomAxis();
	const q = quat.create();
	quat.setAxisAngle(q, v, random(-PI, PI));

	return q;
}