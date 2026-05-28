#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vSeed;

uniform vec3 uColor;

out vec4 oColor;

void main(void) {
    float g = mix(0.6, 0.8, vSeed.x);
    oColor = vec4(vec3(g) * uColor, 1.0);
}