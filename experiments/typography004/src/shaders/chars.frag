#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vPosOffset;
in vec3 vExtra;
in vec2 vUVOffset;
uniform sampler2D uMap;
uniform sampler2D uCharMap;
uniform float uNum;
uniform float uNumChars;
uniform float uRatio;
uniform vec3 uColor;

out vec4 oColor;

void main(void) {
    vec2 uv = vUVOffset * .5 + .5;
    uv.y *= 0.6;
    uv.y += 0.15;

    float total = uNumChars * uNumChars;

    float off = (vExtra.z - 0.5) * 0.;
    // float g = clamp(texture(uMap, uv).r + off, 0.0, 1.0);
    float g = texture(uMap, uv).r + off;
    g = smoothstep(0.1, 1.5, g);

    float index = floor(g * total);
    float u = mod(index, uNumChars) / uNumChars;
    float v = floor(index / uNumChars) / uNumChars;
    vec2 uvChar = vec2(u, v) + vTextureCoord / uNumChars;
    vec4 charColor = texture(uCharMap, uvChar);

    charColor.rgb *= uColor;

    oColor = charColor;
}