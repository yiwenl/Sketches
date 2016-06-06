// sky.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uFogOffset;

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

#define FOG_DENSITY 0.05
const vec3 fogColor = vec3(254.0/255.0, 242.0/255.0, 226.0/255.0);

void main(void) {

	float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount = fogFactorExp2(fogDistance, FOG_DENSITY);
	vec4 color = texture2D(texture, vTextureCoord);
	color.rgb = mix(color.rgb, fogColor, fogAmount+uFogOffset);

    gl_FragColor = color;
}