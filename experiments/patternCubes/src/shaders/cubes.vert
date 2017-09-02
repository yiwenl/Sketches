// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aPosOffset;
attribute vec3 aNormal;
attribute vec3 aExtra;
attribute vec3 aUVIndex;
attribute vec3 aDirection;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float time;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vExtra;
varying vec3 vUVIndex;


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
const float PI2 = PI/2.0;

float exponentialIn(float t) {
  	return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

float exponentialInOut(float t) {
  return t == 0.0 || t == 1.0
    ? t
    : t < 0.5
      ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
      : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
}

void main(void) {
	vec3 position = aVertexPosition;

	float currentAngle = aExtra.z + time;
	float angle = floor((currentAngle)/PI2) * PI2;
	float delta = currentAngle - angle;
	delta = exponentialInOut(smoothstep(PI2-0.2, PI2, delta)) * PI2;

	position = rotate(aVertexPosition, aDirection, angle + delta);

	position += aPosOffset;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);

    vTextureCoord = aTextureCoord;
    vNormal = aNormal;


    vExtra = aExtra;
    vUVIndex = aUVIndex;
}