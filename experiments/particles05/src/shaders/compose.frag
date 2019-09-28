// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureBase;
uniform sampler2D textureAO;

void main(void) {
    vec3 base = texture2D(textureBase, vTextureCoord).xyz;
    vec3 ao = texture2D(textureAO, vTextureCoord).xyz;


    gl_FragColor = vec4(base * ao, 1.0);
}