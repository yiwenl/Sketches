// bufferflies.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUVPosition;
attribute vec3 aColor;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform float percent;

uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec4 viewSpace;
varying float vDepth;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

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

#define MAX_ANGLE 1.0
#define FRONT vec3(0.0, 0.0, 1.0)
#define PI 3.141592657

void main(void) {
	vec3 posCurr 	= texture2D(textureCurr, aUVPosition).xyz;
	vec3 posNext 	= texture2D(textureNext, aUVPosition).xyz;
	vec3 posOffset 	= mix(posCurr, posNext, percent);

	vec3 dir 		= normalize(posNext - posCurr);
	float theta 	= -atan(dir.z/dir.x) + PI * 0.5;

	vec3 position 	= aVertexPosition * aExtra.x;
	

	float offset 	= 2.0;
	float _sign		= 1.0;
	if(aTextureCoord.x > 0.5) _sign = -1.0;
	float angle 	= sin(aTextureCoord.y * offset + uTime + aExtra.g) * MAX_ANGLE + .5;
	angle 			*= _sign;
	position.xy 	= rotate(position.xy, angle);
	position.xz 	= rotate(position.xz, theta);
	position 		+= posOffset;


	viewSpace 		= uViewMatrix * vec4(position, 1.0);

    gl_Position 	= uProjectionMatrix * viewSpace;
    vTextureCoord 	= aTextureCoord;

    vec3 N 			= aNormal;
    N.xy 			= rotate(N.xy, angle);
    vNormal 		= normalize(N);
    vColor 			= aColor;

    vDepth 			= gl_Position.z/ gl_Position.w;
}