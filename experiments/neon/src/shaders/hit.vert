// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform float uHitPlaneZ;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	// vec3 position = uModelViewMatrixInverse * aVertexPosition + vec3(0.0, 0.0, 1.0);
	vec3 position = uModelViewMatrixInverse * (aVertexPosition + vec3(0.0, 0.0, uHitPlaneZ));
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}