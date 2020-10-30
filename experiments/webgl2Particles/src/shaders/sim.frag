#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureExtra;

uniform float uTime;
uniform float uSpeedOffset;

#pragma glslify: snoise = require(glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(glsl-utils/curlNoise.glsl)

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

void main(void) {
    vec3 pos = texture(texturePos, vTextureCoord).xyz;
    vec3 vel = texture(textureVel, vTextureCoord).xyz;
    vec3 extra = texture(textureExtra, vTextureCoord).xyz;

    vec3 acc = vec3(0.0);
    float noiseBase = snoise(pos * 0.1 + extra * 0.05 - uTime * 0.05);
    float posOffset = mix(0.1, 0.12, noiseBase) * 2.0;

    vec3 noise = curlNoise(pos * posOffset + uTime * 0.07);
    acc += noise;


    // pulling back to center
    const float maxRadius = 1.5;
    float dist = length(pos);
    if(dist > maxRadius) {
        float f = dist - maxRadius;
        f = pow(f, 2.0);
        vec3 dir = normalize(pos);
        acc -= dir * f;
    }


    float speedOffset = mix(0.75, 1.0, extra.r);

    vel += acc * 0.002 * speedOffset;
    pos += vel * uSpeedOffset;

    float decreaseRate = mix(1.0, 0.98, uSpeedOffset);
    vel *= 0.98;
    

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(1.0);
}