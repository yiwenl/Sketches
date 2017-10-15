// getRandomAxis.js

var random = function(min, max) { return min + Math.random() * (max - min);	}

export default function() {
	let v;
	do {
		v = vec3.fromValues(random(-1, 1), random(-1, 1), random(-1, 1));
	} while(vec3.length(v) === 0);
	
	vec3.normalize(v, v);

	return v;
}