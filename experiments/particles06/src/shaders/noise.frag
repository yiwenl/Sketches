#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uSeed;
uniform float uNoiseScale;
uniform float uMonochrome;

out vec4 oColor;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)
#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)

void main(void) {
    vec3 pos = vec3(vTextureCoord * 8.0, uSeed) * uNoiseScale;

    float t = 0.485;
    float x = fbm(pos.xyz) - t;
    float y = fbm(pos.yzx) - t;

    float s = 3.0;
    x *= s;
    y *= s;

    if(uMonochrome > .5) {
        oColor = vec4(vec3(x), 1.0);
    } else {
        oColor = vec4(x, y, 0.0, 1.0);
    }
}