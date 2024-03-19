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

out vec3 vColor;
out vec4 vShadowCoord;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.015

void main(void) {

    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    vec3 data = texture(uDataMap, aTextureCoord).xyz;
    float life = data.x;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    float scale = mix(0.5, 1.0, aVertexPosition.x);
    float scaleLife = abs(life - .5);
    scaleLife = smoothstep(0.5, 0.4, scaleLife);
    scale *= scaleLife;

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;

    vShadowCoord = uShadowMatrix * wsPos;
    float g = mix(0.5, 1.0, aVertexPosition.y);
    // vColor = vec3(data.yz, 0.0);
    vColor = vec3(g);
}