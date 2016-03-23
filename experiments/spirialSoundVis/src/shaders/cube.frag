// cube.frag

precision highp float;
varying vec3 vNormal;
uniform vec3 lightPosition;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}

void main(void) {
	float d = diffuse(vNormal, lightPosition);
	gl_FragColor = vec4(vec3(d), 1.0);
	// gl_FragColor = vec4(1.0);
}