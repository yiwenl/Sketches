// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
// varying vec3 vColor;

float diffuse(vec3 N,vec3 L) {
	float d = dot(normalize(N), normalize(L));
	return max(d, 0.0);
}


#define LIGHT vec3(0.25, 0.75, 0.25)

void main(void) {
	float d      = diffuse(vNormal, LIGHT);
	d            = mix(d, 1.0, .1);
	// gl_FragColor = vec4(vColor * d, 1.0);
	gl_FragColor = vec4(vec3(d), 1.0);
}