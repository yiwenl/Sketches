// RandomInCircle.js

let a, u, _r, rr;

function random(mRadius) {
	a = Math.random() * Math.PI * 2;
	u = Math.random() + Math.random();
	_r = (u>1) ? 2 - u : u;
	rr = mRadius * _r;

	return {
		x:Math.cos(a) * rr,
		y:Math.sin(a) * rr
	}
}


export default random;