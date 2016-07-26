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
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform vec3 uPositionOffset;

varying vec2 vTextureCoord;
varying vec3 vWsNormal;
varying vec3 vColor;
varying vec3 vEyePosition;

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
	vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );

	gl_Position				= uProjectionMatrix * viewSpacePosition;
	
	vTextureCoord = aTextureCoord;
	vec3 N        = aNormal;
	N.xz          = rotate(N.xz, aPosOffset.w);
	vWsNormal 	  = N;
	vColor        = aColor;
}