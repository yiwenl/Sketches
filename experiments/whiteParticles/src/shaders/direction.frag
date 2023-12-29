#version 300 es

precision highp float;
in float vDensity;
in float vAlpha;
in vec2 vTextureCoord;
in float vShadow;
uniform sampler2D uMap;

out vec4 oColor;

void main(void) {
    float t = abs(vTextureCoord.y - 0.5);
    float lw = mix(0.02, 0.02, vDensity);
    t = smoothstep(lw + 0.01, lw, t);

    oColor = vec4(vec3(vShadow), t * .5 * vAlpha * mix(0.5, 1.0, vShadow));
}