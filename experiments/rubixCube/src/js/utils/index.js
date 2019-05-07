// index.js

export { saveImage } from './saveImage'


export const selectTop = (cubes) => {
	return cubes.filter( c => {
		return c.position[1] > 0.5;
	});
}


export const selectBottom = (cubes) => {
	return cubes.filter( c => {
		return c.position[1] < -0.5;
	});
}


export const selectLeft = (cubes) => {
	return cubes.filter( c => {
		return c.position[0] < -0.5;
	});
}


export const selectRight = (cubes) => {
	return cubes.filter( c => {
		return c.position[0] > 0.5;
	});
}


export const selectFront = (cubes) => {
	return cubes.filter( c => {
		return c.position[2] > 0.5;
	});
}

export const selectBack = (cubes) => {
	return cubes.filter( c => {
		return c.position[2] < -0.5;
	});
}