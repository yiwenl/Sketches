#version 300 es

precision highp float;
in vec2 vTextureCoord;

#define NUM_STARS ${NUM_STARS}

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;
uniform mat4 uInvertMatrix;
uniform mat4 uCameraMatrix;
uniform float uTime;
uniform float uBound;

uniform vec4 uCenters[NUM_STARS];

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)

#define PI 3.1415926535897932384626433832795

float maxRadius = 5.0; 

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    vec3 acc = vec3(0.0);

    // fluid
    vec3 projectedPos = (uInvertMatrix * vec4(pos, 1.0)).xyz;
    vec2 uv = (projectedPos.xy/uBound) * 0.5 + 0.5;
    vec3 fluid = texture(uFluidMap, uv).xyz;
    float density = texture(uDensityMap, uv).x;
    fluid = (uCameraMatrix * vec4(fluid, 1.0)).xyz;
    density = smoothstep(0.0, 0.5, density);
    density = mix(0.5, 1.0, density);

    acc += fluid * 0.0005 * density;

    // noise
    // float posOffset = mix(0.1, 0.2, data.x);
    float posOffset = snoise(pos * 0.5 + uTime) * .5 + .5;
    float radiusScale = mix(1.0, 1.5, posOffset);
    posOffset = mix(0.1, 0.2, posOffset);
    vec3 noise = curlNoise(pos * posOffset + uTime * 0.1);
    acc += noise * 0.02;

    for(int i=0; i<3; i++) {
        vec3 center = uCenters[i].xyz;
        float mass = uCenters[i].w;
        float massSelf = mix(0.5, 1.0, extra.x);
        vec3 dir = center - pos;
        float r = length(dir);
        r = max(r, 0.01);
        dir = normalize(dir);
        float f = (mass * massSelf / (r * r)) * 0.05;
        f = min(f, 3.0);
        acc += dir * f/massSelf;
    }


    // pull back to center
    vec3 dir = vec3(0.0) - pos;
    float r = length(dir);
    float _radius = radiusScale * maxRadius;
    float f = smoothstep(_radius - 1.0, _radius, r);
    // if(r > _radius) {
        dir = normalize(dir);
        // float f = (r - _radius) * 0.2;
        acc += dir * f;
        vel *= mix(1.0, .8, f);
    // }

    float speed = mix(1.0, 1.5, data.y);
    vel += acc * 0.025 * speed;

    // float maxSpeed = mix(1.0, 1.5, data.z) * 2.5;
    // if(length(vel) > maxSpeed) {
    //     vel = normalize(vel) * maxSpeed;
    // }

    pos += vel;

    vel *= 0.98;

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}