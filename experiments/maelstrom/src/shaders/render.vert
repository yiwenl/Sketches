// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;
uniform float time;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;
varying vec2 vTextureCoord;

const float radius = 0.01;


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

const float PI = 3.141592653;
const vec3 FRONT = vec3(0.0, 0.0, -1.0);
const vec3 UP = vec3(0.0, 1.0, 0.0);

void main(void) {
	// vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, aUV).rgb;
	vec3 posNext = texture2D(textureNext, aUV).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, aUV).rgb;


	vec3 dir      = normalize(posNext - pos);
	vec3 axis     = cross(dir, FRONT);
	float theta   = acos(dot(dir, FRONT));

	vec3 position = aVertexPosition;
	// position.z *= 1.0 + extra.b * 0.5;
	// position.y *= 1.0 + extra.g;
	position = rotate(position, axis, theta) + pos;

	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	
	
	

	float g 	 = sin(extra.r + time * mix(extra.b, 1.0, .5));
	g 			 = smoothstep(0.0, 1.0, g);
	g 			 = mix(g, 1.0, .75);
	vColor       = vec4(vec3(g), 1.0);

	vNormal 	 = rotate(aNormal, axis, theta);
	vTextureCoord = aTextureCoord;
}