#version 300 es

precision highp float;
in vec3 vColor;
in vec3 vRandom;

out vec4 oColor;
#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

#define PI 3.1415926535897932384626433832795


void main(void) {
    // if(distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5)
    //     discard;

    vec2 uv = gl_PointCoord.xy - 0.5;
    uv = abs(rotate(uv, PI / 4.0 * step(vRandom.z, 0.5)));
    float t = 0.1;
    float tx = smoothstep(t + 0.01, t, uv.x);
    float ty = smoothstep(t + 0.01, t, uv.y);

    float alpha = max(tx, ty);

    if(alpha < 0.9) discard;


    oColor = vec4(vColor, 1.0) * 0.15;
}