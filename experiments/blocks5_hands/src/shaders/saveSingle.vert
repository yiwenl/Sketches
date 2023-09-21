#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

out vec3 vPosition;

void main(void) {
    gl_Position = vec4(aTextureCoord, 0.0, 1.0);
    vPosition = aVertexPosition;

    gl_PointSize = 1.0;
}