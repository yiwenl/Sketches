#version 300 es
precision highp float;

in vec4 vWorldPosition;
in vec4 vViewPosition;

out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#define LIGHT vec3(0.2, 1.0, 0.6)

void main(void) {

    vec3 a = dFdx(vWorldPosition.xyz);
    vec3 b = dFdy(vWorldPosition.xyz);
    vec3 n = normalize(cross(a, b));

    float d = diffuse(n, LIGHT, .9);

    float t = 0.2;
    d = smoothstep(1.0 - t, t, d);

    // oFragColor0 = vec4(n, 1.0);
    oColor = vec4(vec3(d), 1.0);
}