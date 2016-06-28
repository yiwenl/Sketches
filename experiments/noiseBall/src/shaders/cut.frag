// cut.frag


#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    if(color.r < 0.5) color.a = 0.0;
    gl_FragColor = color;
}