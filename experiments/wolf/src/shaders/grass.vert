// grass.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aUVOffset;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform mat3 uNormalMatrix;

uniform vec3 uPositionOffset;
uniform sampler2D textureNoise;
uniform float uNumTiles;
uniform vec2 uUVOffset;
uniform vec3 uTouch;

varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vWsNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vColor;
varying float vHeight;


const vec3 touch = vec3(0.0, 3.0, 0.0);
const float PI = 3.141592657;

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


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

const vec3 DEFAULT_NORMAL = vec3(0.0, 0.0, 1.0);

void main(void) {
	//	get height map
	vec2 uv            = aUVOffset / uNumTiles + uUVOffset;
	vUV                = uv;
	vec3 noise         = texture2D(textureNoise, uv).rgb;

	// float heightOffset = 0.0;
	// const vec2 center = vec2(.5);
	// float distToCenter = distance(uv, center);
	// if(distToCenter < .5) {
	// 	heightOffset = 1.0 - distToCenter / 0.5;
	// }
	
	//	vertex position
	float thetaZ       = (aPosOffset.y - 0.5) * 0.5 + (noise.r - 0.5) * 0.75;
	
	vec3 posRelative   = aVertexPosition + vec3(0.0, noise.g * 5.0, 0.0);
	posRelative        = uModelViewMatrixInverse * posRelative;
	vec3 posRelativeMV = posRelative;
	posRelativeMV.xy   = rotate(posRelativeMV.xy, thetaZ);
	vec3 posOffset 	   = aPosOffset * vec3(1.0, 0.0, 1.0); 
	vec3 pos           = posRelativeMV + posOffset + uPositionOffset;


	//	get rotation axis
	vec3 dirToCenter = normalize(pos - uTouch);
	const vec3 YAXIS = vec3(0.0, 1.0, 0.0);
	vec3 axis 	  = normalize(rotate(dirToCenter, YAXIS, PI * .5));

	const float   radius = 10.0;
	float distTouTouch = distance(uTouch, pos);
	float angle   = 1.0;
	const float maxRotation = 1.0;
	if(distTouTouch < radius) {
		angle = distTouTouch / radius;
		angle = sin(angle * PI * .5);
		pos = rotate(posRelativeMV, axis, (1.0 - angle) * maxRotation) + posOffset + uPositionOffset;
		
	}
	vUV.x = angle;

	vec4 worldSpacePosition = uModelMatrix * vec4(pos, 1.0);
	vec4 viewSpacePosition  = uViewMatrix * worldSpacePosition;
	vPosition               = viewSpacePosition.xyz;
	vWsPosition             = worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace    = viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition            = -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	
	gl_Position             = uProjectionMatrix * viewSpacePosition;
	vTextureCoord           = aTextureCoord;
	vec3 N                  = uNormalMatrix * aNormal;
	vWsNormal               = N;
	vColor                  = aColor;
	vHeight 				= noise.g;
}