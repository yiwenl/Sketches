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
uniform float uParticleScale;

out vec3 vColor;
out vec4 vShadowCoord;


#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.006

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    float scale = mix(1.0, 3.0, aVertexPosition.x) * uParticleScale;
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;

    vShadowCoord = uShadowMatrix * wsPos;
    vColor = texture(uColorMap, aVertexPosition.zy).xyz;
}