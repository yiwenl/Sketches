#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aCurrPos;
in vec3 aNextPos;

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

#define xAxis vec3(1.0, 0.0, 0.0)

void main(void) {
    vec3 pos = aVertexPosition;

    vec3 dir = normalize(aNextPos - aCurrPos);
    vec3 axis = cross(dir, xAxis);
    float angle = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, angle);
    vNormal = rotate(aNormal, axis, angle);

    float d = length(aNextPos - aCurrPos);
    d = smoothstep(0.05, 0.15, d);
    pos *= mix(0.25, 2.5, d);

    pos += aCurrPos;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vColor = uColor;
    vShadowCoord = uShadowMatrix * wsPos;
}