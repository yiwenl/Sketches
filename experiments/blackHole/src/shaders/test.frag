// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vFaceNoraml;
uniform float isBlack;
// uniform sampler2D texture;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const vec3 LIGHT = vec3(1.0);

void main(void) {
	vec3 N = normalize(vec3(vTextureCoord, .5));

	float d = diffuse(N, LIGHT);
	float dFace = diffuse(vFaceNoraml, LIGHT);
	if(isBlack > 0.0) {
		d *= 0.05;
		d += dFace * 0.05;
	} else {
		d = mix(d, 0.0, mix(vTextureCoord.x, 0.0, .825));
	}
	vec3 color = vec3(d);
	gl_FragColor = vec4(color, 1.0);

	// if(isBlack > 0.0) {
	// 	gl_FragColor.rgb = vFaceNoraml * .5 + .5;
	// }
	// gl_FragColor = vec4(1.0);
}