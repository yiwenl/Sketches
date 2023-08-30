// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
uniform vec3 uColor;

void main(void) {
    gl_FragColor = vec4(uColor, 1.0);
}