#version 300 es

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec4 aVelocity;
layout(location = 2) in vec4 aColor;
layout(location = 3) in vec4 aRandoms;
layout(location = 4) in vec4 aPosOrg;
layout(location = 5) in vec4 aExtras;   // [speed, scale, life, lifeDecay]

uniform float uNumSteps;

out vec4 oPosition;
out vec4 oVelocity;
out vec4 oColor;
out vec4 oRandoms;
out vec4 oPosOrg;
out vec4 oExtras;

uniform float uTime;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)

void main(void) {
    vec3 pos = aPosition.xyz;
    vec3 vel = aVelocity.xyz;
    float speed = aExtras.x;
    float scale = aExtras.y;
    float life = aExtras.z;
    float lifeDecay = aExtras.w;


    float posOffset = snoise(pos * 0.2 + uTime * 0.2) * .5 + .5;
    posOffset = mix(0.5, 2.0, posOffset) * 0.15;
    vec3 acc = vec3(0.0);
    vec3 curl = curlNoise(pos * posOffset - uTime * 0.2);
    acc += curl;

    float speedLife = smoothstep(0.6, 0.8, life);
    // float speedLife = smoothstep(1.0, 0.6, life);
    speedLife = mix(0.5, 3.0, pow(speedLife, 2.0));
    vel += acc * speed * 0.002 * speedLife;
    vel *= mix(0.85, 0.95, life);
    pos += vel;

    life -= lifeDecay * 0.03;

    if(life <= 0.0) {
        life = 1.0;
        pos = aPosOrg.xyz;
        vel *= 5.0;
    }

    oPosition = vec4(pos, 1.0);
    oVelocity = vec4(vel, 1.0);
    oColor = aColor;
    oRandoms = aRandoms;
    oPosOrg = aPosOrg;
    oExtras = vec4(speed, scale, life, lifeDecay);
}