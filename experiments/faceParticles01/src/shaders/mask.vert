// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uScale;
uniform float uRotation;
uniform vec3 uPosition;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

#pragma glslify: rotate = require(glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition * uScale;
    pos.xy = rotate(pos.xy, uRotation);
    pos += uPosition;
    vec4 wsPosition = uModelMatrix * vec4(pos, 1.0);
    vPosition = wsPosition.xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * wsPosition;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}