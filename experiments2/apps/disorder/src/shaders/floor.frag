#version 300 es

precision highp float;
in vec2 vTextureCoord;

out vec4 oColor;

void main(void) {
    float d = distance(vTextureCoord, vec2(0.5, 0.5));
    d = smoothstep(0.8, 0.2, d);
    d = mix(0.5, 1.0, d);
    oColor = vec4(d, d, d, 1.0);
}