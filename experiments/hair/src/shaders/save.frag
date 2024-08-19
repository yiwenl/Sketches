#version 300 es

precision highp float;
in vec3 vColor;
in vec3 vNormal;

layout(location = 0) out vec4 oColor0;
layout(location = 1) out vec4 oColor1;
layout(location = 2) out vec4 oColor2;
layout(location = 3) out vec4 oColor3;

void main(void) {
    oColor0 = vec4(vColor, 1.0);
    oColor1 = vec4(0.0, 0.0, 0.0, 1.0);
    oColor2 = vec4(vNormal, 1.0);
    oColor3 = vec4(fract(vNormal.zyx+vColor), 1.0);
}