#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uSeed;
uniform float uNoiseScale;

out vec4 oColor;

#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)

void main(void) {
    // vec3 pos = vec3(vTextureCoord, uSeed) * uNoiseScale;
    vec3 pos = (vec3(vTextureCoord, 0.0) + uSeed) * uNoiseScale;

    vec3 noise = curlNoise(pos);

    oColor = vec4(noise, 1.0);
}