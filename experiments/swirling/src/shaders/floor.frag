// floor.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;

uniform float uSum;
uniform float uLightOffset;
// uniform sampler2D texture;


float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}


void main(void) {
	float dist = distance(vTextureCoord, vec2(.5));
	float g = smoothstep(0.5, 0.1 + uSum * 0.1, dist);
	g *= (0.5 + uLightOffset * 0.1 * exponentialIn(g));
    gl_FragColor = vec4(g);
}