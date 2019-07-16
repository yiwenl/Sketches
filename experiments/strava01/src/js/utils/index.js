// index.js

export { saveImage } from './saveImage'

export const map = (v, a, b, c, d) => {
	let p = (v - a) / ( b - a);
	return c + (d - c) * p;
}