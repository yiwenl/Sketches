#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uDepthMap;
out vec4 oColor;

void main(void) {
    float d = texture(uDepthMap, vTextureCoord).r;
    oColor = vec4(d, d, d, 1.0);
}