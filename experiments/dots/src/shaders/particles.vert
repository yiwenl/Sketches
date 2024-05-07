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
uniform vec2 uViewport;
// uniform float uParticleScale;

out vec3 vColor;
out vec4 vShadowCoord;


#define uParticleScale 1.0


#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.006

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    vec3 data = texture(uDataMap, aTextureCoord).xyz;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    float scale = mix(1.0, 1.5, aVertexPosition.x) * uParticleScale;

    scale *= mix(1.0, 3.0, data.x);
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;

    vShadowCoord = uShadowMatrix * wsPos;
    float g = mix(0.5, 1.0, data.x) + aVertexPosition.y * 0.2;
    vColor = vec3(g);
}