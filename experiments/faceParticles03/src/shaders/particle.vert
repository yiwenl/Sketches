#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uDataMap;
uniform sampler2D uColorMap;

uniform vec2 uViewport;

out vec3 vColor;
out vec3 vRandom;
out vec4 vShadowCoord;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.012

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    vec3 vel = texture(uVelMap, aTextureCoord).xyz;

    vec4 vWsPosition = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * vWsPosition;


    float life = texture(uDataMap , aTextureCoord).x;
    float lifeScale = smoothstep(0.5, 0.4, abs(life - 0.5));

    float scale = mix(0.5, 1.5, aVertexPosition.x) * lifeScale;
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;

    float g = mix(.75, 1.0, aVertexPosition.y);


    vec2 uv = fract(aVertexPosition.xy + aVertexPosition.yz);
    vec3 color = texture(uColorMap, uv).xyz;
    color = smoothstep(vec3(0.0), vec3(1.0), color);
    vColor = color * g;

    vShadowCoord = uShadowMatrix * vWsPosition;
    vRandom = aVertexPosition;
}