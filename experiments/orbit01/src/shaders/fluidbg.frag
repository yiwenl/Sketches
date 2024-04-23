#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;
uniform float uTime;

out vec4 oColor;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    vec2 dir = texture(uFluidMap, vTextureCoord).rg;
    float s = 5.0;
    float nx = snoise(vec3(vTextureCoord * s, uTime));
    float ny = snoise(vec3(uTime, vTextureCoord.yx * s));
    dir = -normalize(dir)+ vec2(nx, ny) * 0.2;


    float g = texture(uMap, vTextureCoord + dir * 0.005).r;
    g *= 0.95;
    float fluid = texture(uDensityMap, vTextureCoord).r;

    g += fluid * .5;

    oColor = vec4(vec3(g), 1.0);
}