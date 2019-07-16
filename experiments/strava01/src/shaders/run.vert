// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aPosNext;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uMapScale;
uniform float uHeightScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;


vec3 getPos(vec3 v) {
	return v * vec3(uMapScale, uHeightScale, uMapScale);
}

#define xAxis vec3(1.0, 0.0, 0.0)
#define PI 3.141592653

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

void main(void) {
	float scale   = 0.1;
	vec3 pos      = aVertexPosition * scale;
	
	vec3 posCurr  = getPos(aPosOffset);
	vec3 posNext  = getPos(aPosNext);
	
	vec3 dir      = normalize(posNext - posCurr);
	vec3 axis     = cross(xAxis, dir);
	float theta   = -acos(dot(xAxis, dir));
	
	pos           = rotate(pos, axis, theta);
	
	
	pos           += aPosOffset * vec3(uMapScale, uHeightScale, uMapScale);
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = rotate(aNormal, axis, theta);
}