// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
uniform mat3 uNormalMatrix;
varying vec3 vNormal;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureParticle;
uniform float uTheta;
uniform vec3 uLight;

#define LIGHT_POS vec3(0.0, 8.0, -2.0)

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
	vec4 colorMap = texture2D(textureParticle, uv);
	if(colorMap.r <= 0.0) {
		discard;
	}

	vec3 N = colorMap.rgb * 2.0 - 1.0;
	// N.xz = rotate(N.xz, uTheta);
	float d = diffuse(uNormalMatrix * N, uLight);
	// float d = diffuse(N, LIGHT_POS);
	// d = mix(d, 1.0, vNormal.g * 0.4);
	d *= mix(vNormal.b, 1.0, .5);

	vec4 color = vec4(vec3(d), 1.0);

    gl_FragColor = color;
}