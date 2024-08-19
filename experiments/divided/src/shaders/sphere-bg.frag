#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform vec3 uColor;

out vec4 oColor;



void main(void) {
    float g = step(vTextureCoord.x, .5);
    oColor = vec4(uColor * g, 1.0);
}