// addLife.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
    vec3 life = texture2D(texture, vTextureCoord).rgb;
    life.r += life.g;
    if(life.r >= 1.0) {
    	life.r = 0.0;
    }

    gl_FragColor = vec4(life, 1.0);
}