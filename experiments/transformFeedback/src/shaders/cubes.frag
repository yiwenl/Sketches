#version 300 es

precision highp float;
in vec2 vTextureCoord;

out vec4 oColor;

void main(void) {

    float g = 0.3;
    oColor = vec4(vTextureCoord, 0.0, 1.0);
    oColor = vec4(g, g, g, 1.0);

}