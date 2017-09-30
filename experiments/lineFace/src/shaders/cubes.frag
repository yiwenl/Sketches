// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
// varying vec2 vTextureCoord;
// uniform sampler2D texture;

varying vec3 vNormal;
varying float vOffset;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const vec3 LIGHT = vec3(1.0, .8, .6);

void main(void) {

	float d = diffuse(vNormal, LIGHT);
	d = mix(d, 1.0, .5);


    gl_FragColor = vec4(vec3(d * vOffset), 1.0);
}