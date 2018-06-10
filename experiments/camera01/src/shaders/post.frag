// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureAO;


void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);

    vec4 colorAO = texture2D(textureAO, vTextureCoord);
    colorAO = mix(colorAO, vec4(1.0), .25);
    color *= colorAO;

    gl_FragColor = color;
}