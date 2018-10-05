// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;

void main(void) {
	float g = 1.0;
    gl_FragColor = vec4(vec3(g), 0.1);
}