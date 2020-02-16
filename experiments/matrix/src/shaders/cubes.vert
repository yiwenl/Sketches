// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;
attribute vec3 aAxis;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

#pragma glslify: rotate = require(glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition * aExtra.x + aPosOffset;
    float angle = aExtra.y + uTime * mix(0.2, 1.0, aExtra.z);
    pos = rotate(pos, normalize(aAxis), angle);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vPosition = pos;
}