// mountain.frag
#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;
uniform float uFogOffset;
uniform float uMaxRange;
uniform float uFadeInRange;

float fogFactorExp(float dist, float density) {
	return 1.0 - clamp(exp(-density * dist), 0.0, 1.0);
}


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

	const float MIN_Y = 0.005;
	float opacity = smoothstep(0.0, MIN_Y, abs(vPosition.y));
  vec4 color = texture2D(texture, vTextureCoord);
  color.rgb = mix(color.rgb, fogColor, fogAmount+uFogOffset);

  float distOffset = 0.0;
  const float rangeOffset = 1.75;
  if(vPosition.z < -uFadeInRange) {
    distOffset = smoothstep(-uMaxRange+uFadeInRange+rangeOffset, -uMaxRange+rangeOffset, vPosition.z);
  }
  color.rgb = mix(color.rgb, fogColor, distOffset);
  color *= opacity;

  gl_FragColor = color;
}