#version 300 es

precision highp float;
in vec2 vTextureCoord;
in float vSediment;
uniform sampler2D uSplatMap;

out vec4 oColor;

void main(void) {
    vec4 color = texture(uSplatMap, vTextureCoord);
    color.rgb *= vSediment;
    oColor = color;
}