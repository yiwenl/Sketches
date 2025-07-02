#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aVelocity;
layout(location = 2) in vec3 aColor;
layout(location = 3) in vec3 aRandoms;
layout(location = 4) in vec3 aPosOrg;
layout(location = 5) in float aSpeed;
layout(location = 6) in float aScale;
layout(location = 7) in float aLife;
layout(location = 8) in float aLifeDecay;

uniform float uNumSteps;

out vec3 oPosition;
out vec3 oVelocity;
out vec3 oColor;
out vec3 oRandoms;
out vec3 oPosOrg;
out float oSpeed;
out float oScale;
out float oLife;
out float oLifeDecay;

uniform float uTime;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)

void main(void) {
    vec3 pos = aPosition;
    vec3 vel = aVelocity;

    float posOffset = snoise(pos * 0.3 + uTime * 0.1) * .5 + .5;
    posOffset = mix(0.5, 4.0, posOffset) * 0.2;
    vec3 acc = vec3(0.0);
    vec3 curl = curlNoise(pos * posOffset - uTime * 0.1);
    acc += curl;


    float maxRadius = 5.0;
    float d = length(pos);
    vec3 dir = normalize(pos);
    float f = smoothstep(maxRadius - 2.0, maxRadius, d);
    // acc -= dir * f;


    vel += acc * aSpeed * 0.002;
    vel *= 0.92;
    pos += vel;


    float life = aLife;
    life -= aLifeDecay * 0.01;

    if(life <= 0.0) {
        life = 1.0;
        pos = aPosOrg;
    }
    

    oPosition = pos;
    oVelocity = vel;
    oColor = aColor;
    oRandoms = aRandoms;
    oPosOrg = aPosOrg;
    oSpeed = aSpeed;
    oScale = aScale;
    oLife = life;
    oLifeDecay = aLifeDecay;
}