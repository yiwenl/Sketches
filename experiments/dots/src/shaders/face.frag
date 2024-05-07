#version 300 es
precision highp float;

in vec3 vViewPosition;

uniform float uAlpha;
out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#define LIGHT vec3(1.0, 1.2, 1.5)

void main(void) {
    vec3 dx = dFdx(vViewPosition);
    vec3 dy = dFdy(vViewPosition);
    vec3 N = normalize(cross(dx, dy));

    float d = diffuse(N, LIGHT);
    d = pow(d, 2.0);

    oColor = vec4(vec3(d), uAlpha);
}