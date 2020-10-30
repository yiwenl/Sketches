#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

out vec3 vColor;
out vec3 vNormal;

void main(void) {
    gl_Position = vec4(aTextureCoord, 0.0, 1.0);
    vNormal = aNormal;
    vColor = aVertexPosition;

    gl_PointSize = 1.0;
}