// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

#pragma glslify: diffuse    = require(glsl-utils/diffuse.glsl)

void main(void) {
    gl_FragColor = texture2D(texture, vTextureCoord);
}