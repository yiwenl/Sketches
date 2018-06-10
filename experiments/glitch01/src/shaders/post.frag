// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureBloom;

void main(void) {
	vec4 color      = texture2D(texture, vTextureCoord);
	vec4 colorBloom = texture2D(textureBloom, vTextureCoord);
	color.rgb       += colorBloom.rgb * 0.25;
	gl_FragColor    = color;
}