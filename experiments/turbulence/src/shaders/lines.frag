// lines.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
}