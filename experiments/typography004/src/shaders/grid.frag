#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vExtra;

uniform sampler2D uMap;
uniform vec3 uColor;
out vec4 oColor;

void main(void) {
    float d = abs(vTextureCoord.x - 0.5);

    float t = mix(0.5, .48, vExtra.x);
    float r = mix(0.007, 0.005, vExtra.y);
    d = smoothstep(t - r, t, d);
    oColor = vec4(uColor, 1.0) * d;
}