#version 300 es

precision highp float;
in vec2 vTextureCoord;
in float vSediment;

uniform sampler2D uSplatMap;

out vec4 oColor;

void main(void) {
    oColor = texture(uSplatMap, vTextureCoord);
    oColor.rgb *= max(vSediment, 0.001);
}