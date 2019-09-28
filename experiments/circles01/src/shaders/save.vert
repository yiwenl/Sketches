// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNormal;
varying vec3 vColor;

void main(void) {
	// gl_Position = vec4(aTextureCoord * 2.0 - 1.0, 0.0, 1.0);
	gl_Position = vec4(aTextureCoord, 0.0, 1.0);
	vNormal     = aNormal;
	vColor      = aVertexPosition;

	gl_PointSize = 1.0;
}