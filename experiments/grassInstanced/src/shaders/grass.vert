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

uniform vec3 uHit;
uniform float uPushStrength;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;
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


	float dist = distance(position, uHit);
	const float maxRadius = 5.0;
	if(dist < maxRadius) {
		vec3 dir = normalize(uHit - position);
		float f = (1.0 - dist / maxRadius) * aTextureCoord.y * uPushStrength;
		position.xz -= dir.xz * f;
	}

	vec3 normal 			= aNormal;
	normal.xz 				= rotate(normal.xz, aPosOffset.w);

	vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;

    vNormal					= uNormalMatrix * normal;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;

	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	// gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vColor        = aColor;
}