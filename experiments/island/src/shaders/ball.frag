// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform sampler2D texture;
uniform vec3 lightPos;
uniform mat3 uModelViewMatrixInverse;

const vec3 baseColor = vec3(.1);


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


void main(void) {
	vec3 colorPaper = texture2D(texture, vTextureCoord).rgb;
	vec3 color = colorPaper * baseColor;
	vec3 L = uModelViewMatrixInverse * lightPos;
	float _diff = 1.0 - diffuse(vNormal, L);

	color.rgb *= 1.0 + _diff * 5.0;

    gl_FragColor = vec4(color, 1.0);
}