// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uCap;
uniform float uHeight;

const vec2 size = vec2(0.05, 0.0);
const vec3 off = vec3(-1.0, 0.0, 1.0) * 0.01;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float getHeight(vec2 uv) {
	vec3 color = texture2D(texture, uv).rgb;
	float br = luma(color) * uHeight;
	br = min(uCap, br);
	return br;
}

void main(void) {
    float s11      = getHeight(vTextureCoord);
	
	float s01      = getHeight(vTextureCoord + off.xy);
	float s21      = getHeight(vTextureCoord + off.zy);
	float s10      = getHeight(vTextureCoord + off.yx);
	float s12      = getHeight(vTextureCoord + off.yz);
	
	vec3 va        = normalize(vec3(size.xy,s21-s01));
	vec3 vb        = normalize(vec3(size.yx,s12-s10));
	vec3 n         = cross(va, vb).rbg;


	gl_FragColor = vec4(n, 1.0);
}