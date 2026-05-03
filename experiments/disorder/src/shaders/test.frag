#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uIndex;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord;
    float t = fract((uv.x + uv.y) * 10.0);
    oColor = vec4(vec3(t), 1.0);
}