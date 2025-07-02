#version 300 es

precision highp float;
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aVelocity;
layout(location = 2) in vec3 aColor;
layout(location = 3) in vec3 aRandoms;
layout(location = 4) in vec3 aPosOrg;
layout(location = 5) in float aSpeed;
layout(location = 6) in float aScale;
layout(location = 7) in float aLife;
layout(location = 8) in float aLifeDecay;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uViewport;

out vec3 vColor;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.02

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    vColor = aColor;

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * aScale;
}