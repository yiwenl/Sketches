// depth.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vColor;

void main(void) {
	vec4 V        = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
	gl_Position   = V;
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	float g       = 1.0 - V.z/V.w;
	vColor        = vec4(g, g, g, 1.0);
}