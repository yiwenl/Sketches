precision highp float;

varying vec4 vColor;
varying vec3 vWsPosition;
varying vec4 vPosition;


float getDepth(float z, float n, float f) {
	return (2.0 * n) / (f + n - z*(f-n));
}

void main(void) {
	if(distance(gl_PointCoord, vec2(.5)) > .5) discard;

	float z = vPosition.z/vPosition.w;
	z = z * .5 + .5;
	gl_FragColor = vec4(vec3(z), 1.0);
}