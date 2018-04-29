// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uThickness;
uniform float uRadius;
uniform float uNum;
uniform float uTime;
uniform float uScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;

#define PI 3.141592653
#define Z_AXIS vec3(0, 0, 1)
#define Y_AXIS vec3(0, 1, 0)

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

vec3 getPos() {
	vec3 v;
	float a = aVertexPosition.x / uNum * PI * 2.0;
	float r = uRadius;

	v = vec3((aVertexPosition.y - 0.5) * uThickness, 0.0, uThickness * 0.5);
	vec3 offset = vec3(r, 0, 0);
	offset = rotate(offset, Z_AXIS, a);
	
	v = rotate(v, Y_AXIS, a + aVertexPosition.z * PI * 0.5 + uTime);
	v = rotate(v, Z_AXIS, a);


	v += offset;

	return v * uScale;
}

void main(void) {
	vec3 position = getPos();
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    // vTextureCoord = vec2(aVertexPosition.x/uNum);
    vNormal = aNormal;
}