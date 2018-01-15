// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec4 vWsPosition;

void main(void) {
    gl_FragColor = vWsPosition;
}