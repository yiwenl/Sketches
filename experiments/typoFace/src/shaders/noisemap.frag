#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uSeed;
out vec4 oColor;

// #pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    float scale = 3.0;
    float nx = snoise(vec3(vTextureCoord, uSeed) * scale);
    float ny = snoise(vec3(uSeed, vTextureCoord) * scale);
    float nz = snoise(vec3(vTextureCoord.x, uSeed, vTextureCoord.y) * scale);
    nz = smoothstep(-1.0, 1.0, nz);

    oColor = vec4(nx, ny, nz, 1.0);
}