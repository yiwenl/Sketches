// index.js

export { saveImage } from './saveImage'


export const formNumber = (v, numDigis=6) => {
	let s = v.toString();
	while(s.length < numDigis) {
		s = '0' + s;
	}

	return s;
}


export const biasMatrix = mat4.fromValues(
	0.5, 0.0, 0.0, 0.0,
	0.0, 0.5, 0.0, 0.0,
	0.0, 0.0, 0.5, 0.0,
	0.5, 0.5, 0.5, 1.0
);