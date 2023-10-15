#version 300 es

precision highp float;
in vec3 vNormal;
in vec3 vColor;
in float vSkip;

uniform vec3 uLight;
out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)

void main(void) {
    if(vSkip > 0.5) discard;

    float g = diffuse(vNormal, uLight);
    g = pow(g, 0.5);
    g = mix(g, 1.0, .5);
    oColor = vec4(vColor * g, 1.0);
}