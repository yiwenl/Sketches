// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;

uniform float uOffset;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

const float radius = 0.02;
const float scale = 0.04;

#pragma glslify: rotate    = require(glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition * scale;
    vec3 posNext = aNormal * scale;
    pos = mix(pos, posNext, uOffset);
    pos += vec3(0.0, 1.0, 1.0);

    pos.yz = rotate(pos.yz, 0.1);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset;

    vPosition = pos;
}