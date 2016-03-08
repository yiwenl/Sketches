// touchSphere.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;
uniform vec3 uLightPos;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


void main(void) {
	float _diffuse = diffuse(vNormal, normalize(uLightPos));
	_diffuse = mix(_diffuse, 1.0, .2);
    gl_FragColor = vec4( vec3(_diffuse)*vec3(1.0, 1.0, .95), .35);
}