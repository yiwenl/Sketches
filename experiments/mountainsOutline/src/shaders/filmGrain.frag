// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uOffset;

void main(void) {
    gl_FragColor = texture2D(texture, vTextureCoord * 2.0 + vec2(uOffset, 0.0));
}