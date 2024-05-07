#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;

out vec4 oColor;

void main(void) {
    oColor = texture(uMap, vTextureCoord);
    oColor = mix(vec4(vTextureCoord, 0.0, 1.0), oColor, 0.5);

    // oColor = vec4(vTextureCoord, 0.0, 1.0);
}