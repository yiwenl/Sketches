// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

void main(void) {
	vec3 position = uModelViewMatrixInverse * (uModelMatrix * vec4(aVertexPosition, 1.0)).xyz;
	// vec3 position = (uModelMatrix * vec4(aVertexPosition + vec3(0.0, 0.0, uOffset), 1.0)).xyz;
	gl_Position   = uProjectionMatrix * uViewMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	vPosition 	  = position;
}