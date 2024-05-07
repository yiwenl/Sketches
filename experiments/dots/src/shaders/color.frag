#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;

uniform vec3 uColor;
uniform float uOpacity;

out vec4 oColor;

void main(void) {
    oColor = vec4(uColor, uOpacity);
}