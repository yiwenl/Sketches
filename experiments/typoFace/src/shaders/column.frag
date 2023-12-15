#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vExtra;
in float vGrey;
uniform sampler2D uMap;

uniform float uNumChars;
uniform sampler2D uCharMap;
uniform vec3 uColor;
uniform float uThresholdInvert;

out vec4 oColor;



void main(void) {
    float total = uNumChars * uNumChars;
    float g = vGrey;

    bool inverted = vExtra.z < uThresholdInvert && g > 1.0 / total;

    if(inverted) {
        g = 1.0 - g + 1.0/total;
    }

    float index = floor(g * total);
    float u = mod(index, uNumChars) / uNumChars;
    float v = floor(index / uNumChars) / uNumChars;
    vec2 uvChar = vec2(u, v) + vTextureCoord / uNumChars;
    vec4 charColor = texture(uCharMap, uvChar);
    charColor.rgb = uColor;
    if(inverted) {
        charColor.a = 1.0 - charColor.a;
    }

    oColor = charColor;
    // oColor = vec4(vec3(g), 1.0);
}