#version 300 es

precision highp float;
in vec3 vRandom;

out vec4 oColor;

void main(void) {
    if(distance(gl_PointCoord, vec2(0.5)) > 0.5) {
        discard;
    }

    float g = mix(0.5, 1.0, vRandom.y);
    oColor = vec4(vec3(g), 1.0);
}