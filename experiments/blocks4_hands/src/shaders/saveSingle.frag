#version 300 es

precision highp float;
in vec3 vPosition;
out vec4 oColor;

void main(void) {
    oColor = vec4(vPosition, 1.0);
}