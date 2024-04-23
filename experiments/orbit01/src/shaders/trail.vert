#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform vec3 uColor;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    vec4 wsPos =  uModelMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vColor = uColor;
    vShadowCoord = uShadowMatrix * wsPos;
}