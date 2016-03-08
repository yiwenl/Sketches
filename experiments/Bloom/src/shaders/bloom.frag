// bloom.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureBlur;
uniform float multiply;

void main(void) {
	vec4 color     = texture2D(texture, vTextureCoord);
	vec4 colorBlur = texture2D(textureBlur, vTextureCoord);
	color.rgb      += colorBlur.rgb * multiply;
	gl_FragColor   = color;
}