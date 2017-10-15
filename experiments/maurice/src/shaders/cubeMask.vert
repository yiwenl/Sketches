// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uRotationMask;
uniform mat4 uInvertRotationMatrix;
uniform mat4 uShadowMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uDimensionMask;
uniform vec3 uPositionMask;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vShadowCoord;

void main(void) {
	vec4 position = uRotationMask * vec4(aVertexPosition * uDimensionMask * 2.0, 1.0);
	position.xyz += uPositionMask;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * position;
    vTextureCoord = aTextureCoord;


    vec3 N = (uRotationMask * vec4(aNormal, 1.0)).xyz;
    vNormal = uNormalMatrix * N;
    vPosition = position.xyz;

    vShadowCoord  = uShadowMatrix * uModelMatrix * uInvertRotationMatrix * position;
}