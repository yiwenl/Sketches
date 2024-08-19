#version 300 es
precision highp float;

uniform vec3 uColor;
uniform float uOpacity;

out vec4 fragColor;

void main(void) {
    fragColor = vec4(uColor, uOpacity);
}