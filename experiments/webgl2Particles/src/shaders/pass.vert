#version 300 es

precision highp float;
in vec2 aPosition;
out vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTextureCoord = aPosition * .5 + .5;
}