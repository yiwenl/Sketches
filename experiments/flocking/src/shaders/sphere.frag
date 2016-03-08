// sphere.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform mat3 uNormalMatrix;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


const float fade = 0.95;
const vec3 L0 = vec3(1.0, 1.0, 1.0);
const vec3 L1 = vec3(-1.0, -.5, 1.0);
const vec3 LC0 = vec3(1.0, 1.0, fade);
const vec3 LC1 = vec3(fade, fade, 1.0);

void main(void) {
    vec3 d0 = diffuse(vNormal, L0, LC0) * .5;
    vec3 d1 = diffuse(vNormal, L1, LC1) * .5;

    vec3 color = .3 + d0 + d1;
    gl_FragColor = vec4(color * vec3(1.0, .95, .9), 1.0);

}