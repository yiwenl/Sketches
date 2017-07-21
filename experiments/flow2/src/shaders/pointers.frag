// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;
varying float vSpeed;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const vec3 L = vec3(1.0);

void main(void) {
	float d = diffuse(vNormal, L);
	d = mix(d, 1.0, .25);
    gl_FragColor = vec4(vec3(d), 1.0);
    // gl_FragColor = vec4(vec3(vSpeed), 1.0);
}