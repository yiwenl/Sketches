#version 300 es
precision highp float;

in vec4 vWorldPosition;
in vec4 vViewPosition;

out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#define LIGHT vec3(1.0, 0.8, 0.6)

void main(void) {

    vec3 a = dFdx(vWorldPosition.xyz);
    vec3 b = dFdy(vWorldPosition.xyz);
    vec3 n = normalize(cross(a, b));

    float d = diffuse(n, LIGHT);
    d = pow(d, 1.5);

    oColor = vec4(d, 1.0, 0.0, 1.0);
}