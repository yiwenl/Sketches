// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;
uniform vec3 uLightPos;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


void main(void) {
	float d = diffuse(vNormal, uLightPos);
	d = mix(d, 1.0, .5);

	// vec3 color = vec3(1.0, 1.0, .98);
	vec3 color = vec3(0.85, 0.0, 0.0);
    gl_FragColor = vec4(color * d, 1.0);
}