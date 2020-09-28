// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vColor;

void main(void) {
    gl_FragColor = vec4(vColor, 1.0);
}