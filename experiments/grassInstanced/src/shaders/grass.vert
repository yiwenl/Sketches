// grass.vert

precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec4 aPosOffset;
attribute vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uPositionOffset;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 position = aVertexPosition;
	position.xz   = rotate(position.xz, aPosOffset.w);
	position.xz   += aPosOffset.xz + uPositionOffset.xz;
	position.y    *= aPosOffset.y;
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	vColor        = aColor;
}