// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uShift;


#define PI 3.141592653

void main(void) {

	vec2 uv = vTextureCoord;
	float shift = uShift / PI / 2.0;
	uv.x += shift;
	uv.x = mod(uv.x, 1.0);

    gl_FragColor = texture2D(texture, uv);
}