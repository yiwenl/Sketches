// basic.frag

#define SHADER_NAME BASIC_FRAGMENT

precision lowp float;
varying vec2 vTextureCoord;
uniform float time;
// uniform sampler2D texture;

void main(void) {
    gl_FragColor = vec4(vTextureCoord, sin(time) * .5 + .5, 1.0);
}