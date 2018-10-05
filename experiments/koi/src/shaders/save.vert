// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;

void main(void) {
	vec3 pos      = vec3(aTextureCoord * 2.0 - 1.0, 0.0);
	gl_Position   = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	vColor        = aVertexPosition;
	gl_PointSize  = 1.0;
}