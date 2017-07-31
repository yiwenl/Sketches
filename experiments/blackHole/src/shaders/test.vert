// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aUV;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;
uniform float uWidth;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vFaceNoraml;

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


const vec3 FRONT = vec3(1.0, 0.0, 0.0);
const float PI = 3.141592653;
// const vec3 FRONT = vec3(0.0, 0.0, 0.0);

void main(void) {
	vec3 position = aVertexPosition;
	vec3 posCurr  = texture2D(textureCurr, aUV).rgb;
	vec3 posNext  = texture2D(textureNext, aUV).rgb;
	vec3 pos      = mix(posCurr, posNext, percent);
	vec3 extra    = texture2D(textureExtra, aUV).rgb;

	vec3 dir      = normalize(posNext - pos);
	vec3 axis     = normalize(cross(dir, FRONT));
	float theta   = acos(dot(dir, FRONT));


	float t = abs(aTextureCoord.x - 0.5);
	t = cos(t * PI);
	position.y *= t;
	position 	 *= mix(extra.r, 1.0, .5);
	position.x   *= uWidth;
	
	position      = rotate(position, axis, theta);

	// const float minRange = 10.0;
	// float yOffset = length(pos.xz) - minRange;
	// yOffset = max(yOffset * 0.075, 0.0);
	// yOffset = pow(yOffset, 3.0);
	// pos.y += yOffset;


	position      += pos;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vFaceNoraml = rotate(vec3(1.0, 0.0, 0.0), axis, theta);
    vNormal = rotate(aNormal, axis, theta);
}