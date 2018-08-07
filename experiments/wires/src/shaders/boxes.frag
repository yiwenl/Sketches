// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec4 vColor;

void main(void) {
	if(vColor.a <= 0.01) {
		discard;
	}
    gl_FragColor = vColor;
}