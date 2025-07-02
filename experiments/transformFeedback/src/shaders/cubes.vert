#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aOffset;
in vec3 aScale;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uRotation;
out vec2 vTextureCoord;
out vec3 vNormal;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    float theta = mix(-1.0, 1.0, aExtra.x) * uRotation * 3.0;
    vec3 pos = rotate(aVertexPosition, vec3(0.0, 1.0, 0.0), theta) * aScale + aOffset;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}