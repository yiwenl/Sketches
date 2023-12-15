#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aPosOffset;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vExtra;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {

    vec3 pos = aVertexPosition;
    pos *= aPosOffset.z;
    pos.xy += aPosOffset.xy;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vExtra = aExtra;
}