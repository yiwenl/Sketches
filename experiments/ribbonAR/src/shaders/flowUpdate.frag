#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uMap;
uniform vec2 uPos;
uniform vec2 uDir;
uniform float uStrength;

out vec4 oColor;

void main(void) {
    vec3 color = texture(uMap, vTextureCoord).rgb;

    float d = distance(vTextureCoord, uPos);
    float radius = uStrength * 0.5;
    float t = smoothstep(radius, 0.0, d);

    float f = smoothstep(0.0, 1.0, uStrength);
    color.rg += uDir * t * f * 1.5;

    color *= .99;

    oColor = vec4(color, 1.0);
}