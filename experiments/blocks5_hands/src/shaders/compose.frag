// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uBloomMap;

void main(void) {
    vec4 color = texture2D(uMap, vTextureCoord);
    vec4 colorBloom = texture2D(uBloomMap, vTextureCoord);
    color.rgb += colorBloom.rgb * 0.75;
    gl_FragColor = color;
}