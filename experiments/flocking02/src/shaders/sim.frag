#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;

uniform float uTime;
uniform float uRadius;
uniform float uMaxRadius;
uniform float uSeparationThreshold;
uniform float uNum;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: _normalize    = require(./glsl-utils/_normalize.glsl)
#define PI 3.141592653
#define PI2 PI * 2.0

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    float cycle = data.x;

    int NUM = int(uNum);

    vec2 uvParticle;
    vec3 posParticle, velParticle, diff;
    float f, dist, cycleParticle, diffCycle, t;


    vec3 acc = vec3(0.0);
    float countNeighbour = 0.0;
    vec3 posAverage = vec3(0.0);
    vec3 velAverage = vec3(0.0);

    t = sin(uTime * 0.2) * .5 + .5;
    float radius = uRadius * mix(1.0, 1.5, extra.y) * mix(.8, 1.2, t);
    float separationRadius = radius * uSeparationThreshold;
    float entrainRadius = radius * 0.5;

    float forceMul = 0.95;
    float cycleSync = 0.0;
    

    for(int j=0; j<NUM; j++) {
        for(int i=0; i<NUM; i++) {
            uvParticle = vec2(float(i)/uNum, float(j)/uNum);
            posParticle = texture(uPosMap, uvParticle).xyz;
            velParticle = texture(uVelMap, uvParticle).xyz;
            cycleParticle = texture(uDataMap, uvParticle).x;

            dist = distance(pos, posParticle);
            if(dist > 0.0) {

                // Separation
                if(dist < separationRadius) {
                    diff = pos - posParticle;
                    diff = _normalize(diff) / dist;
                    acc += diff * 0.0001;
                }

                // Cohesion & Alignment
                if(dist < radius) {
                    posAverage += posParticle;
                    velAverage += velParticle;
                    countNeighbour += 1.0;
                }

                // Entrainment
                if(dist < entrainRadius) {
                    diffCycle = cycleParticle - cycle;
                    if(diffCycle > PI) {
                        diffCycle -= PI2;
                    } 
                    if(diffCycle < -PI) {
                        diffCycle += PI2;
                    }
                    cycleSync += diffCycle;
                }
            }

        }
    }

    // Cohesion
    posAverage /= countNeighbour;
    diff = posAverage - pos;
    diff = _normalize(diff) * 0.0005 * forceMul;
    acc += diff;

    // Alignment
    velAverage /= countNeighbour;
    velAverage = _normalize(velAverage) * 0.002 * forceMul;
    acc += velAverage;

    // Noise
    vec3 noise = curlNoise(pos * 0.04 + uTime * 0.1);
    acc += noise * 0.001 * mix(1.0, 2.0, extra.z);

    // Boundary
    t = fract(extra.x + extra.y);
    float maxRadius = uMaxRadius * mix(1.0, 1.25, t);
    if(length(pos) > maxRadius) {
        diff = -_normalize(pos);
        diff *= length(pos) / maxRadius;
        acc += diff * 0.002 * mix(0.5, 2.0, extra.x);
    }

    vel += acc;
    pos += vel * mix(1.0, 2.0, extra.x) * 0.1;
    vel *= 0.97;

    float maxSpeed = 0.1;
    float speed = length(vel);
    if(speed > maxSpeed) {
        vel = _normalize(vel) * maxSpeed;
    }

    float maxNum = uNum * uNum;
    float br = smoothstep(0.0, maxNum * 0.1, countNeighbour);
    data.y = br;

    // write back cycle
    t = mix(0.5, 1.0, cos(uTime * .3234) * .5 + .5);
    cycle += mix(0.1, 0.2, extra.z) * 0.2 + cycleSync * 0.002 * mix(0.5, 1.0, extra.x) * t;
    cycle = mod(cycle, PI * 2.0);
    data.x = cycle;
    

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}