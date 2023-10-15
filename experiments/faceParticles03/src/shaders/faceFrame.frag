#version 300 es

precision highp float;

uniform vec3 uColor;
out vec4 oColor;

void main(void) {
    oColor = vec4(uColor, .05);
}