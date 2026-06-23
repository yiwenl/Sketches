#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform float uTime;
uniform float uSeed;
uniform float uMode;
uniform float uScale;
uniform float uVelocityStrength;
uniform float uDensityStrength;
uniform float uNoiseAmount;

#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord;
    vec3 p = vec3(uv * uScale + uSeed, uTime * 0.25 + uSeed * 0.17);
    vec3 noise = curlNoise(p);

    vec3 color;
    if(uMode < 0.5) {
        // signed vector field for fluid velocity map
        color = vec3(noise.xy * uVelocityStrength, 0.0);
    } else {
        // positive scalar field for fluid density map
        float d = 0.5 + 0.5 * noise.z;
        color = vec3(d * uDensityStrength);
    }

    color *= uNoiseAmount;

    oColor = vec4(color, 1.0);
}
