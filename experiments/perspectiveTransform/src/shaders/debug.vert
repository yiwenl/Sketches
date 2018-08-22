// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uPerspectiveMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	// vec3 position = aVertexPosition;
	// vec4 finalPos = uPerspectiveMatrix * uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);

	// vec3 position = aVertexPosition;
	vec4 finalPos = uProjectionMatrix * uPerspectiveMatrix *uViewMatrix *  vec4(aVertexPosition, 1.0);
	gl_Position   = finalPos;
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
}