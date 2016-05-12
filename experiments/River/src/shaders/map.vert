// reflection.vert

#define SHADER_NAME REFLECTION_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
// attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform vec3 uPosition;
uniform vec3 uScale;
uniform sampler2D textureHeight;

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;


float getHeight(vec2 uv) {
	return texture2D(textureHeight, uv).r;
}


void main(void) {
	vec3 position 			= aVertexPosition;
	position.y 				= getHeight(aTextureCoord);

	const float gap 		= 0.005;
	const float gapUV 		= 0.003;

	vec3 posRight 			= aVertexPosition + vec3(gap, 0.0, 0.0);
	posRight.y 				= getHeight(aTextureCoord + vec2(gapUV, 0.0));

	vec3 posBottom 			= aVertexPosition + vec3(0.0, 0.0, -gap);
	posBottom.y 		    = getHeight(aTextureCoord + vec2(0.0, gapUV));

	vec3 vRight 			= posRight - position;
	vec3 vBottom 			= posBottom - position;
	vec3 N 					= normalize(cross(vRight, vBottom));


	position 				= position * uScale + uPosition;
	vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
    vNormal					= uNormalMatrix * N;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;
}
