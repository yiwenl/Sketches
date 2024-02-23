#version 300 es
precision highp float;

in vec4 vWorldPosition;
in vec4 vViewPosition;
layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;

void main(void) {

    vec3 a = dFdx(vWorldPosition.xyz);
    vec3 b = dFdy(vWorldPosition.xyz);
    vec3 n = normalize(cross(a, b));

    oFragColor0 = vec4(vWorldPosition.xyz/vWorldPosition.w, 1.0);
    oFragColor1 = vec4(n, 1.0);
}