// getRandomPos.js

const { pow, cos, sin, PI } = Math;

export default function(mRadius = 1) {
	const m = mat4.create();
	// const v = vec3.fromValues(0, 0, 1.0 - sin(mRadius * Math.random() * PI/2) );
	// const v = vec3.fromValues(0, 0, 1.0 - pow(cos(mRadius * Math.random() * PI/2), 2) );
	const v = vec3.fromValues(0, 0, mRadius * Math.random());
	mat4.rotateX(m, m, Math.random() * Math.PI * 2);
	mat4.rotateY(m, m, Math.random() * Math.PI * 2);
	mat4.rotateZ(m, m, Math.random() * Math.PI * 2);

	vec3.transformMat4(v, v, m);

	return v;
}