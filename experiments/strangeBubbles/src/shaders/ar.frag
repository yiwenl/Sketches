// copy.frag

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
    gl_FragColor = texture2D(texture, vTextureCoord);
}