// grass.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aUVOffset;
attribute vec3 aNormal;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform vec3 uPositionOffset;
uniform sampler2D textureNoise;
uniform float uNumTiles;
uniform vec2 uUVOffset;
uniform vec3 uTouch;

varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vNormal;


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

void main(void) {
	//	get height map
	vec2 uv            = aUVOffset / uNumTiles + uUVOffset;
	vUV                = uv;
	vec3 noise         = texture2D(textureNoise, uv).rgb;
	
	//	vertex position
	float thetaZ       = (aNormal.x - 0.5) * 0.5 + (noise.r - 0.5) * 0.75;
	float thetaY       = aNormal.y * PI * 2.0;
	
	vec3 posRelative   = aVertexPosition + vec3(0.0, noise.g, 0.0);
	// posRelative.xz  = rotate(posRelative.xz, thetaY);
	posRelative        = uModelViewMatrixInverse * posRelative;
	vec3 posRelativeMV = posRelative;
	posRelativeMV.xy   = rotate(posRelativeMV.xy, thetaZ);
	vec3 pos           = posRelativeMV + aPosOffset + uPositionOffset;


	//	get rotation axis
	// vec3 dirToCenter = normalize(vec3(pos.x - uTouch.x, 0.0, pos.z - uTouch.z));
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
		// if(pos.x < uTouch.x) {
		// 	angle *= -1.0;
		// }
		
		// posRelativeMV    = posRelative;
		// posRelativeMV.xy = rotate(posRelativeMV.xy, thetaZ + angle);
		// pos              = posRelativeMV + aPosOffset + uPositionOffset;
		pos = rotate(posRelativeMV, axis, (1.0 - angle) * maxRotation) + aPosOffset + uPositionOffset;
		
	}
	// pos.y *= angle;
	vUV.x = angle;

	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
}