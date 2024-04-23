#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uSeed;

out vec4 oColor;

#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)
#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    float posOffset = snoise(vec3(uSeed, vTextureCoord) * 200.0) * 0.5 + .5;
    vec3 pos = vec3(vTextureCoord, uSeed) * mix(1500.0, 1000.0, posOffset);
    float g = fbm(pos);
    g = smoothstep(0.2, 0.8, g);


    oColor = vec4(vec3(g), 1.0);
}