// floor.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 		vTextureCoord;
varying float 		vHeight;

uniform sampler2D 	texture;
uniform float		uFogOffset;
uniform vec3		uFogColor;


const float PI = 3.141592657;
const float TwoPI = PI * 2.0;
#define FOG_DENSITY 0.05
float fogFactorExp2(const float dist, const float density) {
  const float LOG2 = -1.442695;
  float d = density * dist;
  float f = 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);

  return smoothstep(uFogOffset, 1.0, f);
}

void main(void) {
	vec2 uv           = vTextureCoord * 15.0;
	vec4 color        = texture2D(texture, uv);
	
	// float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
	// float fogAmount   = fogFactorExp2(fogDistance, FOG_DENSITY);
	// color.rgb         = mix(color.rgb, uFogColor, fogAmount) * ;
	color.rgb *= 0.5;
	gl_FragColor      = color;
}