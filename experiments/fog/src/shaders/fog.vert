// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aPosOffset;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vWsPosition;
varying vec3 vPosition;

void main(void) {
	vec3 pos      = uModelViewMatrixInverse * (aVertexPosition + aPosOffset);
	// vec3 pos      = (aVertexPosition + aPosOffset);
	vWsPosition   = uModelMatrix * vec4(pos, 1.0);
	gl_Position   = uProjectionMatrix * uViewMatrix * vWsPosition;
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	vPosition     = aVertexPosition + vec3(0.0, 0.0, aPosOffset.z);
}