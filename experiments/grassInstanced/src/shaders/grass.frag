// grass.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision lowp float;
varying vec2 vTextureCoord;
varying vec3 vColor;
// uniform sampler2D texture;

void main(void) {
	float g      = mix(vTextureCoord.y, 1.0, .25);
	vec3 color   = vColor * g;
	gl_FragColor = vec4(color, 1.0);
}