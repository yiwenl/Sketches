#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec3 aPosOffset;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uHeightMap;
uniform float uMapSize;
out vec2 vTextureCoord;
out vec3 vNormal;
out float vHeight;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition;
    pos.xz += 0.5;
    pos.xz *= aPosOffset.z;
    pos.xz += aPosOffset.xy;

    vec2 uv = pos.xz / (uMapSize*2.0) + 0.5;
    float y = texture(uHeightMap, uv).r;
    pos.y = y;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = uv;
    vNormal = aNormal;
    vHeight = y;
}