// water.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureReflection;
uniform float uFogDensity;
uniform vec3 uFogColor;

varying vec4 vClipSpace;
varying vec4 vViewSpace;

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

void main(void) {
	vec2 ndc = vClipSpace.xy / vClipSpace.w;
	ndc = ndc * 0.5 + 0.5;

	vec2 uvReflect = vec2(ndc.x, 1.0-ndc.y);
	vec4 color = texture2D(textureReflection, uvReflect);
	color.rgb *= vec3(0.65, 0.65, 0.70);

	float fogDistance 	= length(vViewSpace);
	float fogAmount 	= fogFactorExp2(fogDistance, uFogDensity);
	color.rgb 			= mix(color.rgb, uFogColor, fogAmount);

    gl_FragColor = color;
}