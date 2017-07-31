// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D textureMap;

void main(void) {
	float offset = texture2D(textureMap, vTextureCoord).r;
	vec4 color0 = texture2D(texture0, vTextureCoord);
	vec4 color1 = texture2D(texture1, vTextureCoord);

    gl_FragColor = mix(color1, color0, offset);
}