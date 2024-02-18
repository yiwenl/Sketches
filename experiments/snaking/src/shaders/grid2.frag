#version 300 es

precision highp float;
in vec2 vTextureCoord;
in float vSkip;
in float vGrey;
in vec3 vColor;

uniform sampler2D uMap;
uniform vec3 uColor;

out vec4 oColor;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)


#define COLOR_RED vec3(1.0, 0.0, 0.0)
#define COLOR_GREEN vec3(0.0, 1.0, 0.0)
#define COLOR_BLUE vec3(0.0, 0.0, 1.0)

void main(void) {
    if(vSkip > .5) {
        discard;
    }
    
    vec4 color = texture(uMap, vTextureCoord);

    float gap = 0.05;
    // float minDist = 0.39;
    float maxDist = 0.2;
    float minDist = maxDist - 0.02;

    float head = vGrey + gap;
    float d = distance(color.r, head);
    float g = smoothstep(maxDist, minDist, d);
    vec3 color0 = COLOR_RED * g;

    head = vGrey;
    d = distance(color.r, head);
    g = smoothstep(maxDist, minDist, d);
    vec3 color1 = COLOR_GREEN * g;


    head = vGrey - gap;
    d = distance(color.r, head);
    g = smoothstep(maxDist, minDist, d);
    vec3 color2 = COLOR_BLUE * g;


    // oColor = vec4(uColor, g * color.a);
    float a = step(.9, color.a);
    oColor = vec4(color0 + color1 + color2, 1.0) * a;
}