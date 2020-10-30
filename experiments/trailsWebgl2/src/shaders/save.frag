#version 300 es

precision highp float;
in vec3 vColor;
in vec3 vNormal;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;
layout (location = 4) out vec4 oFragColor4;

void main(void) {
    vec2 vel = normalize(vColor.xy) * 0.01;

    oFragColor0 = vec4(vColor, 1.0);
    oFragColor1 = vec4(vel, 0.0, 1.0);
    oFragColor2 = vec4(vNormal, 1.0);
    oFragColor3 = vec4(vNormal.x, 0.0, 0.0, 1.0);
    oFragColor4 = vec4(0.0, 0.0, 0.0, 1.0);
}