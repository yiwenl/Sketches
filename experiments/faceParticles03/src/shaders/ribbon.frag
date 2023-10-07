#version 300 es

precision highp float;
in vec3 vColor;
in vec2 vTextureCoord;
out vec4 oColor;

void main(void) {
    oColor = vec4(vTextureCoord, 0.0, 1.0);
    oColor = vec4(vColor, 1.0);
}