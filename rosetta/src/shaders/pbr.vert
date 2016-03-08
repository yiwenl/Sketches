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
uniform vec3 position;
uniform float rotation;
uniform vec3 scale;

// wheelX:1.63,
// 	wheelY:-0.63,
// 	wheelZ:2.60,


varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;

varying vec3 vNormalWorldSpace;
varying vec3 vEyeDirWorldSpace;


vec2 rotate(vec2 v, float a) {
	float c = cos(a);
	float s = sin(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 pos 				= aVertexPosition;
	pos.yz					= rotate(pos.yz, -rotation);
	pos 					= pos * scale + position;
	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
    vNormal					= uNormalMatrix * aNormal;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;

	//	test code
	// vec4 eyeDirViewSpace   = viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyeDirWorldSpace      = vec3( uModelViewMatrixInverse * eyeDirViewSpace.rgb );
	vec3 normalViewSpace   = uNormalMatrix * aNormal;
	vNormalWorldSpace      = normalize( vec3( vec4( normalViewSpace, 0 ) * uViewMatrix ) );		
}
