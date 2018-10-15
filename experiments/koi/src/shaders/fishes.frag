// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

// #define USE_COLORMAP 0

precision highp float;
varying vec3 vDebug;
varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec3 vUVOffset;

uniform vec3 uColor;
uniform float uUseTexture;
uniform sampler2D textureSkin;

#define DARK_BLUE vec3(32.0, 35.0, 40.0)/255.0


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


#define LIGHT  vec3(0.0, 1.0, 0.0)
#define PI 3.141592653

void main(void) {
	float d      = diffuse(vNormal, LIGHT);

	vec2 uv = rotate(vTextureCoord, vUVOffset.z * PI * 2.0);
	uv = uv * 0.25 + vUVOffset.xy;
	vec4 color = texture2D(textureSkin, uv);

	d = mix(d, 1.0, .8);
	color.rgb *= d;

	vec3 colorBW   = DARK_BLUE;
	colorBW        += pow(1.0 - d, 5.0) * 0.1;
	gl_FragColor = mix(vec4(colorBW, 1.0), color, uUseTexture);

}