// clouds.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uVRViewMatrix;
uniform mat4 uVRProjectionMatrix;
uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

#define PI 3.141592657

void main(void) {
	vec3 position 	= aVertexPosition;
	position.xy 	*= aExtra.xy;
	position.z  	-= aPosOffset.z;
	position.yz 	= rotate(position.yz, aPosOffset.x);
	position.xz 	= rotate(position.xz, aPosOffset.y + uTime * aExtra.z);


    gl_Position 	= uVRProjectionMatrix * uVRViewMatrix * vec4(position, 1.0);
    vTextureCoord 	= aTextureCoord;
    vNormal 		= aNormal;
    vPosition 		= position;
}