#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uDataMap;
uniform sampler2D uColorMap;
uniform sampler2D uDisplacementMap;
uniform vec2 uViewport;
uniform vec2 uOffset;
uniform float uParticleScale;
uniform float uPlaneSize;
uniform float uTime;

out vec3 vColor;
out vec4 vShadowCoord;

const float radius = 0.015;
#pragma glslify: particleSize = require(glsl-utils/particleSize.glsl)
#pragma glslify: rotate = require(glsl-utils/rotate.glsl)


void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    vShadowCoord = uShadowMatrix * wsPos;
    
    vColor = texture(uColorMap, aVertexPosition.yz).xyz;

    float life = vColor.x;
    float scaleLife = smoothstep(0.0, 0.2, life);
    float scaleDiff = mix(1.0, 1.5, aVertexPosition.x);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scaleDiff * scaleLife * uParticleScale;

}