// pbr.frag

precision mediump float;

varying vec3        vNormal;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const vec3 L = vec3(0.5, 0.5, 1.0);

void main() {
	vec3 N 				= normalize( vNormal );
	float d = diffuse(N, L);
	d = mix(d, 1.0, .25);

	gl_FragColor = vec4(d, d, d, 1.0);

}