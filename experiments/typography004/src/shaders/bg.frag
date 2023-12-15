#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform vec3 uColor;
uniform float uSeed;
uniform float uRatio;
uniform sampler2D uMap;

out vec4 oColor;

#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)

void main(void) {

    vec4 color = texture(uMap, vTextureCoord);
    color.rgb *= uColor;

    vec2 uv = vTextureCoord - 0.5;
    uv.y /= uRatio;
    float d = length(uv);
    float offset = step(uRatio, 1.0) * 0.3;
    float vignette = smoothstep(0.6 + offset, 0.3 + offset, d);
    vignette = mix(0.75, 1.0, vignette);
    color.rgb *= vignette;

    oColor = color;
}