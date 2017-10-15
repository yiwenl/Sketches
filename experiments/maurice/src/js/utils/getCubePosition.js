// getCubePosition.js

// import getRandomPos from './getRandomPos';

var random = function(min, max) { return min + Math.random() * (max - min);	}


const distance = function(v0, v1) {
	return vec3.distance(v0, v1);
}


const getRandomPos = function(mRadius) {
	return vec3.fromValues(
			random(-mRadius, mRadius),
			random(-mRadius, mRadius),
			random(-mRadius, mRadius)
		)
}


export default function getCubePosition(mCubes, mRadius = 5, minDist = 2) {
	let pos;

	let numTries = 0;

	const checkDist = (pos) => {
		let dist;
		let tooClose = false;
		mCubes.forEach( cube => {
			dist = distance(cube.position, pos);
			if(dist < minDist) {
				tooClose = true;
			}
		});

		return tooClose;
	}


	do {
		pos = getRandomPos(mRadius);
		numTries++;
	} while(checkDist(pos) && numTries < 100);

	return pos;
}