#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform vec2 uViewport;

uniform sampler2D uPosMap;
uniform sampler2D uDataMap;
uniform sampler2D uColorMap;
uniform float uParticleScale;

out vec4 vShadowCoord;
out vec3 vColor;
out vec3 vExtra;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.01

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    float life = texture(uDataMap, aTextureCoord).x;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    float scaleLife = smoothstep(0.0, 0.1, life);
    float scale = aVertexPosition.x * uParticleScale * scaleLife;
    gl_PointSize = particleSize(gl_Position,uProjectionMatrix, uViewport, radius) * scale;
    vColor = texture(uColorMap, aTextureCoord).xyz;

    vShadowCoord = uShadowMatrix * wsPos;
    vExtra = aVertexPosition;
}