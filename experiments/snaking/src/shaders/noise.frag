#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uSeed;
out vec4 oColor;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    vec3 pos = vec3(vTextureCoord * 2.0, uSeed);
    float n = snoise(pos) * .5 + .5;
    oColor = vec4(vec3(n), 1.0);
}