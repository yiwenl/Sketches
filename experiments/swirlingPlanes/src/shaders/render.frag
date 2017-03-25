precision highp float;
varying vec3 vNormal;
varying vec3 vColor;

// const vec3 L = vec3(0.0, 0.0, 1.0);
const vec3 L = vec3(0.25, 0.5, 1.0);

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	float d = diffuse(vNormal, L);

	d = mix(d, 1.0, .5);

	gl_FragColor = vec4(vColor * d, 1.0);
}