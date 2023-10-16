#version 300 es
#define LUT_FLIP_Y 1

precision highp float;

in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uSeed;
uniform float uTime;
uniform float uRatio;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)
float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 greyscale(vec3 color, float str) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), str);
}

vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

#define PI 3.1415926535897932384626433832795

out vec4 oColor;

#define NUM 2

void main(void) {
    vec4 color = texture(uMap, vTextureCoord);
    vec3 colorInverted = greyscale(1.0 - color.rgb);
    colorInverted = smoothstep(vec3(0.0), vec3(1.0), colorInverted);
    colorInverted *= vec3(1.0, .975, .94) * 1.2;

    float offset = step(vTextureCoord.y, .5) * 100.0;

    float globalScale = 0.15;

    float tt = 0.0;
    float theta = atan(1.0/uRatio) * 0.0;
    for(int i=0; i<NUM; i++) {
        float mul = pow(4.0, float(i));

        float gap = 0.1 / globalScale / mul;
        vec2 uv = vTextureCoord - 0.5;
        uv = rotate(uv, theta);
        uv.y /= uRatio;

        uv = floor(uv / gap) * gap;


        float r = rand(uv.yx + 100.0);
        r = step(r, 0.02);

        vec2 _uv = rotate(vTextureCoord, theta);
        _uv = rotate(_uv - 0.5, r * PI * 0.5) + 0.5;

        offset = rand(uv) * 100.0;

        float m = 0.65 + float(i) * 0.04;
        float s = 20.0 * globalScale;
        float _s = 200.0;
        float _x = floor(_uv.x * _s)/_s;
        float t = fbm(vec3(_uv.xx * s + offset, uTime)) + rand(vec2(_x)) * .02;
        // tt += smoothstep(m, m + 0.001, t);
        tt += step(m, t);
    }

    tt = step(0.5, tt);

    color.rgb = mix(color.rgb, colorInverted, tt);
    

    vec2 uv = vTextureCoord - 0.5;
    uv.y /= uRatio;
    float t = smoothstep(0.5, 0.3, length(uv));
    color.rgb *= mix(.5, 1.0, t);

    oColor = color;
    
}