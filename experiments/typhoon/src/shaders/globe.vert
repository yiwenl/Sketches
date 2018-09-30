// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uRadius;
uniform float uSize;
uniform float uOffset;
uniform float uNum;
uniform float uShift;

varying vec2 vTextureCoord;
varying vec3 vNormal;


#define PI 3.141592653

vec3 getPlanePos( vec2 v ) {
	float w = uSize * 2.0;
	float h = uSize;
	float nx = uNum;
	float ny = uNum/2.0;

	float x = -w/2.0 + v.x/nx * w;
	float z = h/2.0 - v.y/ny * h;

	return vec3(x, 0.0, z);
}


vec3 getSpherePos( vec2 v) {

	float nx = uNum;
	float ny = uNum/2.0;

	float ry = -v.x / nx * PI * 2.0 - PI * 0.5;
	float rx = v.y / ny * PI - PI * 0.5;

	float y = sin(rx) * uRadius;
	float r = cos(rx) * uRadius;
	float x = cos(ry) * r;
	float z = sin(ry) * r;

	return vec3(x, y, z);
}


void main(void) {
	vec3 posPlane  = getPlanePos(aVertexPosition.xy);
	vec3 posSphere = getSpherePos(aVertexPosition.xy);
	vec3 pos       = mix(posPlane, posSphere, uOffset);
	
	gl_Position    = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord  = aTextureCoord;
	vNormal        = aNormal;
}