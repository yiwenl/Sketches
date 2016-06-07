precision highp float;

const int NUM = ${NUM};

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aCenter;
attribute vec4 aRotation;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform float uOffset;

uniform vec3 uTouch;
uniform float uTouchRadius;

uniform vec4 uTouches[NUM];

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;

varying vec4 vRotation;
varying float vOffset;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}


float getOffset(vec3 pos) {
	float offset = 0.0;
	for( int i=0; i<NUM; i++) {
		vec3 touch = uTouches[i].xyz;
		float distToTouch = distance(pos, touch);
		if(distToTouch < uTouchRadius) {
			offset += (1.0 - distToTouch/uTouchRadius) * 1.5 * uTouches[i].w;
		}
	}

	offset = clamp(offset, 0.0, 1.0);
	return offset;
}


void main(void) {
	vec3 tmpPos 			= aVertexPosition + aCenter;
	// float distToTouch 		= distance(tmpPos, uTouch);
	float offset 			= getOffset(tmpPos);
	// offset 					= smoothstep(0.0, 0.5, offset);


	float angle 			= aRotation.w * offset;
	vec3 relativePos 		= rotate(aVertexPosition, aRotation.xyz, angle);

	vec3 position 			= relativePos + aCenter;
	vec3 spherePosition		= normalize(position);
	position 				= mix(spherePosition, position, offset);

	vec4 worldSpacePosition	= uModelMatrix * vec4(position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;

    vec3 N 					= aNormal;
    N						= mix(spherePosition, N, offset);
    N 						= rotate(N, aRotation.xyz, angle);
    vNormal					= uNormalMatrix * N;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;
	vRotation 				= aRotation;
	vOffset 				= offset;
}

