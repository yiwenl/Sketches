// planes.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

uniform mat3 uNormalMatrix;
varying vec3 vNormal;
varying vec3 vVertex;
varying vec3 vExtra;
varying float vDepth;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), .0);
}


const vec3 LIGHT = vec3(0.0, 1.0, 1.0);

void main(void) {
	vec3 N = uNormalMatrix * normalize(vNormal);
	float _diffuse = diffuse(N, LIGHT);
	// _diffuse = mix(_diffuse, 1.0, 0.3);

    gl_FragColor = vec4(vec3(_diffuse), 1.0);
}