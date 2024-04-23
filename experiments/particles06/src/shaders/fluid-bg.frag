#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;

out vec4 oColor;

void main(void) {
    float g = texture(uMap, vTextureCoord).r;
    g = smoothstep(0.0, 0.2, g);
    oColor = vec4(vec3(g), 1.0);
}