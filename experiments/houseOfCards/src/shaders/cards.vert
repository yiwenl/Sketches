// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aAxis;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord;

#pragma glslify:rotate    = require(glsl-utils/rotate.glsl)

void main(void) {
    vec3 pos = aVertexPosition;
    pos += aPosOffset;

    float angle = mix(uTime, 1.0, aExtra.y) + aExtra.x;
    pos = rotate(pos, aAxis, angle);


    vec4 wsPosition  = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPosition;
    

    vShadowCoord = uShadowMatrix * wsPosition;
    vTextureCoord = aTextureCoord;
    vNormal = rotate(aNormal, aAxis, angle);
}