// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform vec3 uPosition;
uniform float uScale;
uniform vec4 uQuat;
uniform float uOpacity;

varying vec2 vTextureCoord;
varying vec3 vNormal;

vec4 multQuat(vec4 q1, vec4 q2) {
	return vec4(
	q1.w * q2.x + q1.x * q2.w + q1.z * q2.y - q1.y * q2.z,
	q1.w * q2.y + q1.y * q2.w + q1.x * q2.z - q1.z * q2.x,
	q1.w * q2.z + q1.z * q2.w + q1.y * q2.x - q1.x * q2.y,
	q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z
	);
}

vec3 rotate_vector( vec4 quat, vec3 vec ) {
	return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

void main(void) {
	vec4 quat     = uQuat;
	quat.w        *= -1.0;
	
	vec3 position = aVertexPosition;
	position.z 	  += (1.0 - uOpacity) * 0.01;
	position.xy   *= uOpacity;
	position      = rotate_vector(quat, position) + uPosition;
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = rotate_vector(quat, aNormal);
}