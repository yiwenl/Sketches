// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;


const vec2 center = vec2(.5);

void main(void) {
	float d = distance(vTextureCoord, center);
	d = smoothstep(.5, .1, d);
    gl_FragColor = vec4(vec3(.5), d);
}