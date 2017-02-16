// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aPosOffset;
attribute vec2 aExtra;
attribute vec2 aUVOffset;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {

	float theta   = aPosOffset.x + uTime * aExtra.g;
	vec3 position = (aVertexPosition * aExtra.r) + vec3(0.0, aPosOffset.y, -aPosOffset.z);
	position.xz   = rotate(position.xz, theta);
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord * .5 + aUVOffset;
	vNormal       = aNormal;
}