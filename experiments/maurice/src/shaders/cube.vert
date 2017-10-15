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
uniform vec3 uPositionMask;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vShadowCoord;

void main(void) {
	vec3 position = aVertexPosition;
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = uNormalMatrix * aNormal;
	vPosition     = position;
	vShadowCoord  = uShadowMatrix * uModelMatrix * uInvertRotationMatrix * vec4(position, 1.0);
}