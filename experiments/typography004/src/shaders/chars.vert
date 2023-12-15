#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aPosOffset;
in vec3 aExtra;
in vec2 aUVOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uOffset;

out vec2 vTextureCoord;
out vec2 vUVOffset;
out vec3 vPosOffset;
out vec3 vExtra;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition;
    pos *= aPosOffset.z;
    // pos.xy += aPosOffset.xy + uOffset + (aExtra.xy - 0.5) * 0.04;
    pos.xy += aPosOffset.xy + uOffset + (aExtra.xy - 0.5) * 0.04;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    
    vPosOffset = aPosOffset;
    vUVOffset = aUVOffset;
    vExtra = aExtra;
}