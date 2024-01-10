#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;
uniform float uTime;
uniform float uBound;

out vec4 oColor;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)
#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)

vec2 _normalize(vec2 v) {
    if (length(v) > 0.0) {
        return normalize(v);
    } else {
        return vec2(0.0);
    }
}

#define PI 3.1415926535897932384626433832795

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 noise = curlNoise(pos * 0.5 + uTime * 0.15);
    pos += noise * 0.2;

    vec2 uv = pos.xy / uBound * .5 + .5;
    vec2 vel = _normalize(texture(uFluidMap, uv).xy);
    float density = texture(uDensityMap, uv).x;
    density = smoothstep(0.0, 1.0, density);
    density = mix(0.2, 1.0, density);
    // density = 1.0;

    pos.xy += vel * density * 0.5;

    oColor = vec4(pos, 1.0);
}