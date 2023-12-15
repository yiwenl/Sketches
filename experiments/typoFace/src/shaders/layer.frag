#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uBaseMap;
uniform vec3 uColor;
uniform vec2 uOffset;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord + uOffset * 0.03;
    vec4 colorBase = texture(uBaseMap, vTextureCoord);
    vec4 colorMap = texture(uMap, uv);
    // colorMap.rgb = uColor;
    vec4 colorMul = colorBase * colorMap;
    oColor = mix(colorBase, colorMul, colorMap.a);
}