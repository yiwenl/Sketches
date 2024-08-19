// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;
#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#define LIGHT vec3(1.0, 0.8, 0.6)

void main(void) {
    float g = diffuse(vNormal, LIGHT, .5);
    gl_FragColor = vec4(vec3(g), 1.0);
}