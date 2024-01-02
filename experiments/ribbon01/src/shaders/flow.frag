#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vExtra;
in vec3 vColor;

out vec4 oColor;

void main(void) {
    float d = distance(gl_PointCoord, vec2(0.5));
    d = smoothstep(0.5, 0.49, d);
    oColor = vec4(vColor, .2) * d;
}