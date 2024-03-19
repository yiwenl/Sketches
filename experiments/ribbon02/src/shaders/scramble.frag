#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;
uniform float uTime;
uniform float uStrength;
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
#define minY -3.0

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 noise = curlNoise(pos * 0.5 + uTime * 0.15);
    pos += noise * 0.002;

    vec2 uv = pos.xy / uBound * .5 + .5;
    vec2 vel = texture(uFluidMap, uv).xy;
    float density = texture(uDensityMap, uv).x;
    density = smoothstep(0.0, 1.0, density);
    density = mix(0.25, 1.0, density);

    float dz = abs(pos.z - 2.0);
    dz = smoothstep(3.0, 0.0, dz);

    pos.xy += vel * 0.0002 * density * dz * uStrength;

    float d = length(pos);
    float maxRadius = 8.0;
    if(d > maxRadius) {
        pos = normalize(pos) * maxRadius;
    }

    if(pos.y < minY) {
        pos.y += (minY - pos.y) * 0.1;
    }

    oColor = vec4(pos, 1.0);
}