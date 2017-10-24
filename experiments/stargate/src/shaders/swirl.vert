// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float zScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

const float LENGTH = 10.0;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {

	vec3 position = aVertexPosition;

	float a = pow(position.z, 1.2) * 1.1;
	// position.xy = rotate(position.xy, a);
	position.z *= zScale;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vec3 N = aNormal;
    N.xy = rotate(N.xy, a);
    vNormal = N;

    vPosition = position;
}