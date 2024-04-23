#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uRatio;
uniform float uTime;
uniform vec3 uColor;

out vec4 oColor;

#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)

#define PI 3.14159265359

void main(void) {

    // noise
    vec2 uv = vTextureCoord;
    uv.y /= uRatio;
    float n = snoise(vec3(uv * 2.0, uTime * 0.5)) * .5 + .5;
    float t = 0.3;
    n = smoothstep(t, 1.0 - t, n);

    float theta = -PI * 0.15;
    float gap = 1.0 / 3.0;
    float gridScale = 280.0;
    uv = vTextureCoord;
    // uv = vTextureCoord - 0.5;
    // uv = rotate(uv, theta) + 0.5;
    uv.y = floor(uv.y * gridScale) / gridScale;
    vec4 color = texture(uMap, uv);

    uv = vTextureCoord;
    // uv = vTextureCoord - 0.5;
    // uv = rotate(uv, theta) + 0.5;
    uv.y = fract(uv.y * gridScale);

    float g = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    // g = smoothstep(0.0, 0.5, g);


    // layer 1
    t = 0.1;
    float l0 = smoothstep(0.5 - t, 0.5 - t - 0.01, uv.y);
    l0 *= step(gap, g);
    
    // layer 2
    float l1 = smoothstep(1.0 - t, 1.0 - t - 0.01, uv.y) 
             * smoothstep(0.5, 0.51, uv.y);
    l1 *= step(gap * 2.0, g);

    // layer 3
    float l2 = step(gap * 3.0, g);

    vec4 colorDither = vec4( vec3(l0 + l1 + l2), 1.0);
    vec4 colorOrg = texture(uMap, vTextureCoord);


    vec4 colorFinal = colorOrg + colorDither * n;


    uv = vTextureCoord - .5;
    uv.y /= uRatio;

    vec2 center = vec2(0.15, 0.15);
    float d = distance(uv, center);
    float vingnette = smoothstep(0.8, 0.2, d);

    colorFinal.rgb *= mix(0.5, 1.0, vingnette);

    oColor = colorFinal;
    // oColor = vec4(l0, l1, 0.0, 1.0);
    // oColor = colorDither;
}