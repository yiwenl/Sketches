// reflection.vert

#define SHADER_NAME REFLECTION_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform sampler2D uColorMap;
uniform sampler2D uVelMap;
uniform float uPlaneSize;

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;
varying vec3 vDebug;
varying vec3 vColor;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

const float PI = 3.141592653;

void main(void) {
	vec2 uv 				= aPosOffset.xz / uPlaneSize * 0.5 + 0.5;
	vec3 vel			    = texture2D(uVelMap, uv).rgb;
	float speed 		   	= length(vel);
	speed 					= smoothstep(0.0, 200.0, speed);

	float sizeXY		    = mix(aExtra.r, 1.0, .5);
	vec3 position 			= aVertexPosition;
	position.xy 			*= sizeXY * (1.0 + speed);
	position.y 				*= (1.0 + speed * 5.0);
	position.z 				*= (1.0 + speed * 2.0);
	vec3 scale 				= mix(aExtra, vec3(1.0), .5);
	position 				*= scale * (1.0 + speed);


	

	float angle 			= atan(vel.y, vel.x) + PI * 0.5;
	// vDebug					= vec3(speed);
	vDebug					= vel;
	// vDebug					= vel * .5 + .5;
	position.xz 			= rotate(position.xz, angle);

	vColor 					= texture2D(uColorMap, uv).rgb;


	position 				+= aPosOffset;
	vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
	vec3 N 					= aNormal;
	N.xz 					= rotate(N.xz, angle);
    vNormal					= uNormalMatrix * aNormal;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;
}
