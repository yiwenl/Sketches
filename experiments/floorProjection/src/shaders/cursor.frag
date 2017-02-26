// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;

// uniform vec3 uColor;
uniform float uOffset;
uniform float uOpacity;


const vec3 LIGHT  = vec3(0.0, 1.0, 1.0);

const vec3 color = vec3(1.0, 0.573, 0.596);
const vec3 white = vec3(1.0);

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {

	vec3 finalColor = mix(white, color, uOffset);

	float d = diffuse(vNormal, LIGHT);
	d = mix(d, 1.0, .7);

    gl_FragColor = vec4(finalColor * d, uOpacity);
}