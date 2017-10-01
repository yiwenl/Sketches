// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uPlane;
uniform vec3 uPositionMask;
uniform mat3 uNormalMatrix;
uniform vec3 uDimensionMask;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vPositionRotated;
varying vec3 vBounds;


mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
	vec3 rr = vec3(sin(roll), cos(roll), 0.0);
	vec3 ww = normalize(target - origin);
	vec3 uu = normalize(cross(ww, rr));
	vec3 vv = normalize(cross(uu, ww));

	return mat3(uu, vv, ww);
}


const vec3 center = vec3(0.0);
const float bias = 0.001;

void main(void) {

	vec3 dir         = normalize(uPlane.xyz);
	mat3 mtxRotate   = calcLookAtMatrix(center, dir, 0.0);
	vec3 posRotated  = mtxRotate * aVertexPosition + dir * (uPlane.w-bias);
	vec3 position    = posRotated + uPositionMask;
	
	gl_Position      = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord    = aTextureCoord;
	vNormal          = uNormalMatrix * mtxRotate * aNormal;
	vPosition        = position;
	vPositionRotated = posRotated;
}