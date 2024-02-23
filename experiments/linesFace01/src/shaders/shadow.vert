#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec4 vShadowCoord;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition;
    pos.z -= 0.25;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vShadowCoord = uShadowMatrix * wsPos;
    vNormal = aNormal;
}