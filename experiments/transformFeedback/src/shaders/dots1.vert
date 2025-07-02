#version 300 es

precision highp float;
layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec4 aVelocity;
layout(location = 2) in vec4 aColor;
layout(location = 3) in vec4 aRandoms;
layout(location = 4) in vec4 aPosOrg;
layout(location = 5) in vec4 aExtras;   // [speed, scale, life, lifeDecay]


uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uViewport;

out vec3 vColor;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.05

void main(void) {
    vec3 pos = aPosition.xyz;
    float scale = aExtras.y;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vColor = aColor.rgb;

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;
    // gl_PointSize = 10.0;
}