// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aUV;
attribute vec3 aPosOffset;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vExtra;

void main(void) {
    vec3 pos = aVertexPosition;
    pos += aPosOffset;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vUV = aUV;
    vExtra = aExtra;
}