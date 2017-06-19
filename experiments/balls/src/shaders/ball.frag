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

void main(void) {
	float d = diffuse(vNormal, vec3(1.0));
	d = mix(d, 1.0, .5);
    gl_FragColor = vec4(vec3(d * 0.2), 1.0);
}