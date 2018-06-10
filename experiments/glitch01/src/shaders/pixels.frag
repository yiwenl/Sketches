// copy.frag

precision highp float;
varying vec4 vColor;
varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
    gl_FragColor = vColor;
    // gl_FragColor = vec4(1.0);
}