// sky.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;
uniform float uFogOffset;
uniform float uOffset;

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
	
	float offset = smoothstep(5.0, 1.0, vPosition.y);
	color.rgb = mix(color.rgb, fogColor, offset);

	float grey = (color.r + color.g + color.b) / 3.0;
	color.rgb = mix(color.rgb, vec3(grey), uOffset);

    gl_FragColor = color;
}