// grass2.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

varying vec2 vUV;

void main(void) {
	vec4 color   = texture2D(texture, vTextureCoord);
	if(color.a <= 0.75) discard;

	float shadow = mix(vTextureCoord.y, 1.0, .25);
	color.rgb    *= shadow;
	gl_FragColor = color;
}