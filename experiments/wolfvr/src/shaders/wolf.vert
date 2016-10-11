// wolf.vert

#define SHADER_NAME WOLF_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform mat4 uVRViewMatrix;
uniform mat4 uVRProjectionMatrix;

uniform vec3 uPosition;
uniform vec3 uScale;

uniform vec2 uUVOffset;
uniform sampler2D uHeightMap;
uniform float uMaxHeight;
uniform float uYOffset;

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;


void main(void) {
	vec3 position 			= aVertexPosition * uScale + uPosition;
	float colorHeight 		= texture2D(uHeightMap, uUVOffset).r * uMaxHeight;
	position.y 				+= colorHeight + uYOffset;
	vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uVRViewMatrix * worldSpacePosition;
	
    vNormal					= uNormalMatrix * aNormal;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uVRProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;
}
