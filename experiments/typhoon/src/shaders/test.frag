// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

#define Light vec3(0.0, 0.5, 1.0)

void main(void) {
	float d      = diffuse(vNormal, Light);
	d            = mix(d, 1.0, .1);
	gl_FragColor = vec4(vec3(d), 1.0);
}