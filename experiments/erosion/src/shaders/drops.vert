#version 300 es

precision highp float;
in vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uTerrainSize;
uniform sampler2D uPosMap;
uniform sampler2D uDataMap;
uniform vec2 uViewport;

out vec3 vColor;


#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.01

void main(void) {
    vec3 pos = texture(uPosMap, aVertexPosition.xy).xyz;
    vec3 data = texture(uDataMap, aVertexPosition.xy).xyz;

    pos.xz *= uTerrainSize * .5;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius);

    vColor = data;
}