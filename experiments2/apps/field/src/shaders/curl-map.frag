#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform float uOffset;
uniform float uComplexity;

out vec4 oColor;

#include "chunks/curl-noise.glsl"

void main(void) {
    vec3 seed = vec3(vTextureCoord.x, uOffset + vTextureCoord.y, uOffset) * uComplexity;
    vec3 curl = curlNoise(seed);

    oColor = vec4(curl.xy * 0.5 + 0.5, 0.0, 1.0);
}
