// cube.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform sampler2D texture;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


const vec3 LIGHT = vec3(1.0, 0.75, 0.5);

void main(void) {
	float d = diffuse(vNormal, LIGHT);
    // gl_FragColor = texture2D(texture, vTextureCoord);
    gl_FragColor = vec4(vec3(d), 1.0);
}