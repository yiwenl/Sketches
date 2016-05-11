// dome.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aCenter;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float waveFront;
uniform float waveLength;
uniform vec3 startPosition;

varying vec2 vTextureCoord;
varying vec3 vNormal;

const float RADIUS = 2.75;
// const vec3 startPoint = vec3(0.0, 0.0, -RADIUS);
const vec3 startPoint = vec3(0.0, RADIUS, 0.0);
const float PI = 3.141592657;

mat4 rotationMatrix(vec3 axis, float angle)
{
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

	vec3 relativePos = aVertexPosition - aCenter;

	vec3 axis = cross(startPoint, aNormal);
	// float d = distance(aVertexPosition, startPoint) / RADIUS / 2.0;
	// float angle = d * PI;

	float distToStartPoint = distance(aCenter, startPosition);
	float distToWaveFront = distance(distToStartPoint, waveFront);
	float angle = 0.0;
	if(distToWaveFront < waveLength) {
		angle = (1.0 - distToWaveFront/waveLength) * PI;
	}


	relativePos = rotate(relativePos, axis, angle);

	vec3 finalPosition = aCenter + relativePos;


    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(finalPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}