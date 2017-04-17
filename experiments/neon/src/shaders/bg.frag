// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

uniform vec3 color;

void main(void) {
    gl_FragColor = texture2D(texture, vTextureCoord);
    gl_FragColor.rgb *= color;
}