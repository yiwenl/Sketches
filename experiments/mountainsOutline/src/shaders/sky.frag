// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureNext;
uniform float uOffset;

void main(void) {
    vec4 curr = texture2D(texture, vTextureCoord);
    vec4 next = texture2D(textureNext, vTextureCoord);

    gl_FragColor = mix(curr, next, uOffset);
}