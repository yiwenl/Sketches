// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureNormal;
uniform sampler2D textureGradient;
uniform sampler2D textureOverlay;
uniform float uFade;
uniform float uRatio;
uniform vec2 uHit;
uniform vec2 uDimension;
uniform float uOpening;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

const vec3 LIGHT = vec3(1.0, .8, .6);

void main(void) {
	vec3 colorNormal = texture2D(textureNormal, vTextureCoord).rgb;
	vec3 N = normalize(colorNormal);

	float d = diffuse(N, LIGHT);
	d = pow(d-0.05, 3.0);

	vec2 uv = vec2(d, .5);
	vec3 color = texture2D(textureGradient, uv).rgb;

	uv = gl_FragCoord.xy / uDimension;
	vec3 colorOverlay = texture2D(textureOverlay, uv).rgb;

	// color = blendOverlay(color, colorOverlay, .6);
	color = blendOverlay(color, colorOverlay, .4);

    gl_FragColor = vec4(color, 1.0);
}