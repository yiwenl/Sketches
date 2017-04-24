// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;


void main(void) {
	vec2 center = vec2(.5);
	float d = distance(vTextureCoord, center);
	d = smoothstep(0.5, 0.1, d) * 0.25;
    gl_FragColor = vec4(vec3(d), 1.0);
}