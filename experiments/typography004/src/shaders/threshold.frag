#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uThreshold;

out vec4 oColor;

void main(void) {
    vec4 color = texture(uMap, vTextureCoord);
    color.a = step(uThreshold, color.a);
    // float t = 0.1;
    // color.a = smoothstep(uThreshold - t, uThreshold + t, color.a);
    oColor = color;
}