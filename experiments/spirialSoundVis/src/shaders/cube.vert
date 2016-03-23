// cube.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform float rotation;
uniform float size;
uniform float radius;

varying vec2 vTextureCoord;
varying vec3 vNormal;


vec2 rotate(vec2 v, float a) {
	float c = cos(a);
	float s = sin(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


void main(void) {
	vec3 pos = aVertexPosition;
	pos.y += 0.5;
	pos.y *= size;
	pos.x += radius;
	pos.xz = rotate(pos.xz, rotation);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vNormal.xz = rotate(vNormal.xz, rotation);
    vNormal = uNormalMatrix * vNormal;
}