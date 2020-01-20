// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosStart;
attribute vec3 aPosEnd;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uLineWidth;

varying vec2 vTextureCoord;
varying vec3 vNormalOrg;
varying vec3 vNormal;
varying vec3 vDebug;

#define PI 3.141592653

#pragma glslify: rotate    = require(glsl-utils/rotate.glsl)

void main(void) {

    vec3 pos = vec3(0.0, 0.0, uLineWidth * aExtra.x);
    float a = aTextureCoord.y * PI * 2.0;
    pos.yz = rotate(pos.yz, -a);
    vec3 posOffset = mix(aPosStart, aPosEnd, aVertexPosition.x);
    pos += posOffset;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormalOrg = aNormal;

    vec3 n = vec3(0.0, 0.0, 1.0);
    n.yz = rotate(n.yz, -a);
    vNormal = n;

    vDebug = aVertexPosition;
}