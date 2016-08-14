precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;

varying vec2 vTextureCoord;
varying vec3 vNormal;


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


#define PI 3.141592653

void main(void) {
	vec3 curr     = texture2D(textureCurr, aUV).xyz;
	vec3 next     = texture2D(textureNext, aUV).xyz;
	vec3 extra    = texture2D(textureExtra, aUV).xyz;
	vec3 now      = mix(curr, next, percent);
	
	vec3 dir      = normalize( mix(now, next, 0.1) - curr);
	vec3 up       = vec3(0.0, 0.0, 1.0);
	vec3 axis     = normalize(cross(dir, up));
	float theta   = extra.b * PI;
	float angle   = acos(dot(dir, up));
	
	vec3 position = aVertexPosition * (extra.r * 0.25);
	position      = rotate(position, up, theta);
	position      = rotate(position, axis, angle);
	position      += now;
	gl_Position   = uProjectionMatrix * uViewMatrix * vec4(position, 1.0);
	
	vTextureCoord = aTextureCoord;
	vec3 N        = rotate(aNormal, up, theta);
	N             = rotate(N, axis, angle);
	vNormal       = N;
}