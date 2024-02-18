#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uNoiseScale;
uniform float uSeed;
uniform float uMono;
uniform float uNormalize;

out vec4 oColor;

#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)

void main(void) {

    vec3 pos = vec3(vTextureCoord, uSeed) * uNoiseScale;
    float t = 0.6;
    vec3 posBase = pos.zyx;
    posBase *= 0.2;
    float tBase = smoothstep(-t, t, snoise(posBase));
    tBase = mix(0.1, 1.0, tBase);

    float nx = snoise(pos.xyz) * tBase;
    float ny = snoise(pos.yzx) * tBase;
    float nz = snoise(pos.zxy) * tBase;

    if(uNormalize > .5) {
        nx = nx * .5 + .5;
        ny = ny * .5 + .5;
        nz = nz * .5 + .5;
    }

    if(uMono > 0.5) {
        ny = nx;
        nz = nx;
    }

    oColor = vec4(nx, ny, nz, 1.0);
}