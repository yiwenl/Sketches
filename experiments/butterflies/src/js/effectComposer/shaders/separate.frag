// rgbseparate.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float range;

void main(void) {
	vec2 uvRed = vTextureCoord + vec2(-range, 0.0);
	vec2 uvBlue = vTextureCoord + vec2( range, 0.0);
	float r = texture2D(texture, uvRed).r;
	float g = texture2D(texture, vTextureCoord).r;
	float b = texture2D(texture, uvBlue).b;
    gl_FragColor = vec4(r, g, b, 1.0);
}