#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aData;

out vec3 vPosition;
out vec3 vNormal;
out vec3 vData;

void main(void) {
    gl_Position = vec4(aTextureCoord, 0.0, 1.0);
    vPosition = aVertexPosition;
    vNormal = aNormal;
    vData = aData;

    gl_PointSize = 2.0;
}