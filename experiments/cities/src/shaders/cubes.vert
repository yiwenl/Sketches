// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aSize;
attribute vec3 aExtra;
attribute vec3 aDirection;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform vec3 uHit;
uniform float uDrawForce;
uniform float uTime;

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;
varying vec3 vExtra;
varying vec3 vDirection;

void main(void) {
	vec3 position = aVertexPosition * aSize + aPosOffset;

	float distToTouch = distance(aPosOffset, uHit);
	const float maxRadius = 1.5;
	float f = smoothstep(maxRadius, 0.0, distToTouch);
	vec3 dir = normalize(uHit - aPosOffset);
	position += dir * f * uDrawForce;


	float offset = sin(aExtra.r + aExtra.b * uTime);
	position += offset * aDirection * 0.3;
	// position += aDirection * f * uDrawForce;


    vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
    vNormal					= uNormalMatrix * aNormal;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;
	vExtra = aExtra;
	vDirection = aDirection;
}