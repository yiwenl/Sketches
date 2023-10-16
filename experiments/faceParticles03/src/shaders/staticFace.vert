#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uColorMap;

uniform vec2 uViewport;
uniform float uTime;
uniform float uOffsetOpen;
uniform float uParticleScale;

out vec2 vTextureCoord;
out vec3 vRandom;
out vec3 vColor;
out vec4 vShadowCoord;
out float vSkip;

#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)
#define radius 0.012 * .5

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz + (aVertexPosition - 0.5) * 0.05;
    pos.xy *= 1.02;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    // particle size
    float offset = clamp(uOffsetOpen * 2.0 - fract(aVertexPosition.x + aVertexPosition.y), 0.0, 1.0);
    vSkip = offset <= 0.01 ? 1.0 : 0.0;
    float scale = aVertexPosition.x * offset * uParticleScale;

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;

    // varying
    vRandom = aVertexPosition;
    vShadowCoord = uShadowMatrix * wsPos;
    vColor = texture(uColorMap, aVertexPosition.yz).xyz;
}