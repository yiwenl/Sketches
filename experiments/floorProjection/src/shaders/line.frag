// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

const vec3 color = vec3(1.0, 0.573, 0.596);

void main(void) {
    gl_FragColor = vec4(color, 1.0);
}