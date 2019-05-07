// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vColor;
uniform sampler2D texture;

void main(void) {
    gl_FragColor = vec4(vColor, 1.0);
}