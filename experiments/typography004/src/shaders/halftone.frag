#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uRatio;

out vec4 oColor;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

#define PI 3.1415926535897932384626433832795

void main(void) {
    float t = 0.0005;
    vec2 gap = vec2(t, t * uRatio);

    // vec2 _uv = vTextureCoord - .5;
    // _uv = rotate(_uv, PI * 0.25) + 0.5;

    vec2 uv = floor(vTextureCoord / gap) * gap;
    vec2 uvLocal = fract(vTextureCoord / gap);


    vec4 color = texture(uMap, uv);
    float r = step(0.05, color.r + color.g + color.b) * 0.5;
    float d = distance(uvLocal, vec2(0.5, 0.5));
    color.a *= smoothstep(0.1 + r, 0.1 + r - 0.01, d);

    oColor = vec4(uv, 0.0, 1.0);
    oColor = vec4(uvLocal, 0.0, 1.0);
    oColor = color;
}