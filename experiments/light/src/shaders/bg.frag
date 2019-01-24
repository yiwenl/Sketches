// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
	float d = distance(vTextureCoord, vec2(.5));
	d = smoothstep(0.75, 0.0, d) * 0.2;
    gl_FragColor = vec4(vec3(d), 1.0);
}