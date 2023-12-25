#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uDensityMap;
uniform sampler2D uVelocityMap;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;

void main(void) {
    oFragColor0 = texture(uVelocityMap, vTextureCoord);
    oFragColor1 = texture(uDensityMap, vTextureCoord);
}