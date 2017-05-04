precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main() {
	gl_Position = uProjectionMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
	vNormal = aNormal;
	vTextureCoord = aTextureCoord;
}