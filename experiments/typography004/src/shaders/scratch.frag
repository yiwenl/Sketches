#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uSeed;
uniform float uRatio;
uniform float uThreshold;
out vec4 oColor;

#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)

void main(void) {
    vec2 uv = vTextureCoord;
    uv.y /= uRatio;
    float noiseScale = 0.5;
    float n0 = fbm(vec3(uv, uSeed) * 200.0 * noiseScale);
    float n1 = fbm(vec3(uSeed, uv) * 800.0 * noiseScale);
    // n1 = mix(0.4, 1.0, n1);

    float n = n0 + (n1 - 0.5) * 0.25;

    n = smoothstep(uThreshold, uThreshold + 0.01, n);

    vec4 color = texture(uMap, vTextureCoord);
    color.a *= n;

    oColor = color;
}