// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vDebug;

#define DARK_BLUE vec3(32.0, 35.0, 40.0)/255.0

void main(void) {
	float g = 0.1;
    // gl_FragColor = vec4(vec3(g), 1.0);
    // gl_FragColor = vec4(vDebug, 1.0);
    gl_FragColor = vec4(DARK_BLUE, 1.0);
}