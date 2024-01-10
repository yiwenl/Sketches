#version 300 es

precision highp float;
in vec3 vPosition;
in vec3 vData;
in vec3 vNormal;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;

void main(void) {
    oFragColor0 = vec4(vPosition, 1.0);
    oFragColor1 = vec4(1.0, 0.0, 0.0, 1.0);
    oFragColor2 = vec4(vNormal, 1.0);
}