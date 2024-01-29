#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uViewport;
uniform sampler2D uPosMap;
uniform sampler2D uColorMapCurr;
uniform sampler2D uColorMapPrev;
uniform float uColorOffset;

out vec3 vRandom;
out vec3 vColor;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.025

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    float scale = mix(1.0, 2.0, aVertexPosition.x);

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius * scale);

    float g = mix(0.8, 1.0, aVertexPosition.y);

    float offset = clamp(uColorOffset * 2.0 - aVertexPosition.z, 0.0, 1.0);

    vec3 colorCurr = texture(uColorMapCurr, aVertexPosition.yz).xyz;
    vec3 colorPrev = texture(uColorMapPrev, aVertexPosition.yz).xyz;
    vec3 color = mix(colorPrev, colorCurr, offset);

    vColor = color * g;
    vRandom = aVertexPosition;
}