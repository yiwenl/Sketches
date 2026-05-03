#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTextureCoord;


void main(void) {
    gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}