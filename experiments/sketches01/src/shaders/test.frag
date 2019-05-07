// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;

#define FRONT vec3(0.0, 0.0, 1.0)


float angleBetween( vec3 a, vec3 b ) {
	return acos(dot(a, b));
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


#define PI 3.141592653

void main(void) {
	vec3 v       = vec3(1.0, 0.0, 0.0);
	vec3 n       = normalize(vNormal);
	vec3 axis    = cross(n, FRONT);
	float a      = angleBetween(n, FRONT);
	v            = rotate(v, axis, a);
	float theta  = atan(v.y, v.x);
	if(theta < 0.0) {
		theta += PI * 2.0;
	}

	theta = theta / PI / 2.0;

	gl_FragColor = vec4(vec3(theta), 1.0);
}