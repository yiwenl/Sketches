#version 300 es
precision highp float;
in vec3 vColor;
uniform float uOpacity;
out vec4 oColor;

void main(void) {
    oColor = vec4(vColor, uOpacity);
}