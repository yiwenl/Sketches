// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vDebug;
varying vec3 vNormal;

uniform vec3 uColor;

#define DARK_BLUE vec3(32.0, 35.0, 40.0)/255.0


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


#define LIGHT  vec3(0.0, 1.0, 0.0)

void main(void) {

	float d      = diffuse(vNormal, LIGHT);
	vec3 color   = uColor/255.0;
	color        += pow(1.0 - d, 5.0) * 0.1;
	gl_FragColor = vec4(color, 1.0);


}