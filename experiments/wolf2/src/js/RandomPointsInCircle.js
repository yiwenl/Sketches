// RandomPointsInCircle.js

function randomPoints(radius) {
	const t = Math.PI * 2 * Math.random();
	const u = Math.random() * Math.random();
	const r = (u > 1) ? (2 - u) : u;
	return [r * radius * Math.cos(t), r * radius * Math.sin(t)];
}


export default randomPoints;