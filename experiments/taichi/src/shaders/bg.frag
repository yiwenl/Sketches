// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureMap;
uniform sampler2D textureBg;

void main(void) {
	vec3 colorMap = texture2D(textureMap, vTextureCoord).rgb;
	vec3 color    = texture2D(textureBg, vTextureCoord).rgb;
	color         *= colorMap;
	gl_FragColor  = vec4(color, 1.0);
}