// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aExtra;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;

uniform float uPercent;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vTextureCoord;


const vec3 FRONT = vec3(0.0, 0.0, -1.0);
const vec3 UP = vec3(0.0, 1.0, 0.0);


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
	vec2 uv       = aUV;
	
	vec3 posCurr  = texture2D(textureCurr, uv).rgb;
	vec3 posNext  = texture2D(textureNext, uv).rgb;
	vec3 pos      = mix(posCurr, posNext, uPercent);
	
	vec3 dir      = normalize(posNext - pos);
	vec3 axis     = cross(dir, FRONT);
	float theta   = acos(dot(dir, FRONT));

	float scale   = sin(aExtra.z + uTime * aExtra.r) * .4 + .6;
	
	vec3 position = aVertexPosition;
	position      *= scale;
	position 	  = rotate(position, axis, theta) + pos;
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	
	vNormal       = rotate(aNormal, axis, theta);
	vTextureCoord = aTextureCoord;
	
	float c       = mix(aExtra.r, 1.0, .8);
	vColor        = vec3(c);
}
