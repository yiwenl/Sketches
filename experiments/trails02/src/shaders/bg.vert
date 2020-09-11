// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vVertex;

#pragma glslify: rotate = require(glsl-utils/rotate.glsl)
#define PI 3.141592653

void main(void) {
    mat4 matView = uViewMatrix;
    matView[3][0] = 0.0;
    matView[3][1] = 0.0;
    matView[3][2] = 0.0;

    gl_Position = uProjectionMatrix * matView * uModelMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    vec3 p = aVertexPosition;
    p.xz = rotate(p.xz, -PI/2.0 - 0.5);
    vVertex = p;
}