#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;


out float vTheta;
out vec3 vExtra;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.1

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    vec3 vel = texture(uVelMap, aTextureCoord).xyz;

    vec2 dir = normalize(vel.xy);
    vTheta = atan(dir.y, dir.x);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    float scale = mix(0.5, 1.0, aVertexPosition.x);
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;

    vExtra = aVertexPosition;
}