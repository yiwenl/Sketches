// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;

void main(void) {
    // gl_FragColor = texture2D(texture, vTextureCoord);
    gl_FragColor = vec4(vPosition, 1.0);
}