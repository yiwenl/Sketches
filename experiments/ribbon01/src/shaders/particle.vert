#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uViewport;
uniform sampler2D uPosMap;
uniform sampler2D uColorMap;

out vec3 vColor;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.015

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    float scale = mix(1.0, 2.0, aVertexPosition.x);

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius * scale);

    float g = mix(0.8, 1.0, aVertexPosition.y);
    vec3 color = texture(uColorMap, aVertexPosition.yz).xyz;
    vColor = color * g;
}