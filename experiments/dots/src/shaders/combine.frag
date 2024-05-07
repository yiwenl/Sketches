#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMapA;
uniform sampler2D uMapB;

out vec4 oColor;

void main(void) {
    float a = texture(uMapA, vTextureCoord).x;
    float b = texture(uMapB, vTextureCoord).x;
    a = max(a, b);
    oColor = vec4(vec3(a), 1.0);
}