// reflection.vert

#define SHADER_NAME REFLECTION_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform vec3 uPosition;
uniform vec3 uScale;
uniform float uRotation;

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


void main(void) {
	vec3 position      		= aVertexPosition * uScale;
	position.xz 		  	= rotate(position.xz, uRotation);
	position 				+= uPosition;

	vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
	vec3 N 					= aNormal;
	N.xz 					= rotate(N.xz, uRotation);
    vNormal					= uNormalMatrix * N;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;
}
