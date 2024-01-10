#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uSeed;

out vec4 oColor;

#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)

void main(void) {
    vec3 pos = vec3(vTextureCoord, uSeed);

    float n = fbm(pos * 3.0);

    n = smoothstep(0.2, 0.9, n) * 2.0;
    
    oColor = vec4(vec3(n), 1.0);
}