#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aPosOffset;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uMap;
uniform vec2 uOffset;

out vec2 vTextureCoord;
out vec3 vExtra;
out vec2 vUV;
out float vGrey;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition + aPosOffset;
    pos.xy += uOffset;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vExtra = aExtra;

    vec4 screenPos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosOffset, 1.0);
    vec2 uv = screenPos.xy / screenPos.w * .5 + .5;

    vGrey = texture(uMap, uv).r;
    // vGrey = uv.x;
}