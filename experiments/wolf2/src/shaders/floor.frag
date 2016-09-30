#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureNormal;
uniform vec3 uBaseColor;
uniform vec2 uUVWolf;
uniform float uLightIntensity;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}

float getShadow(vec2 uv) {
	const float RANGE = 0.035;
	uv.y = contrast(uv.y, 0.5);
	float distWolf = distance(uv, uUVWolf);
	float shadowWolf = smoothstep(RANGE, 0.0, distWolf);
	return shadowWolf * 0.2;
}

void main(void) {
	vec3 N 		= texture2D(textureNormal, vTextureCoord).rgb * 2.0 - 1.0;
	float d 	= diffuse(N, vec3(1.0));
	d 			= mix(d, 1.0, .6);
	vec3 color 	= uBaseColor * d;

	float shadowWolf = getShadow(vTextureCoord);
	color -= shadowWolf;

	color 		*= uLightIntensity;

    gl_FragColor = vec4(color, 1.0);
}