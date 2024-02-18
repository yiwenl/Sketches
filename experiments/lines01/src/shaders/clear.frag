#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;

out vec4 oColor;

void main(void) {
    oColor = texture(uMap, vTextureCoord);
}