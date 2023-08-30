#version 300 es

#define NUM_LINES 10
precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uPosOrgMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;
uniform sampler2D uSpawnMap;

uniform float uBound;
uniform float uTime;


uniform vec3 uPointAs[NUM_LINES];
uniform vec3 uPointBs[NUM_LINES];

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;
layout (location = 4) out vec4 oFragColor4;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)

#define PI 3.1415926535897932384626433832795

void main(void) {
    bool needUpdate = false;

    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;
    vec3 spawn = texture(uSpawnMap, vTextureCoord).xyz;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;
    float life = data.x;
    life -= mix(1.0, 4.0, data.y) * 0.003;

    vec3 acc = vec3(0.0);

    // fluid force
    vec2 uvFluid = pos.xy / uBound * .5 + .5;

    vec3 fluid = texture(uFluidMap, uvFluid).xyz;
    float density = texture(uDensityMap, uvFluid).x;
    density = mix(0.5, 1.0, density);

    // depth noise
    float noise = snoise(vec3(pos * 0.75 + uTime * 0.5 + extra * 0.1));
    acc.z += noise * 20.0 * density;

    acc += fluid * 0.03 * density;

    float speed = mix(1.0, 2.0, extra.x);
    vel += acc * speed * 0.00005;
    vel *= 0.93;

    pos += vel;

    if(life < 0.0) {
        life = 1.0;
        // pos = posOrg;
        vel = normalize(posOrg) * -0.01;

        int index = int(spawn.x * float(NUM_LINES));
        vec3 pointA = uPointAs[index];
        vec3 pointB = uPointBs[index];
        pos = mix(pointA, pointB, spawn.y);
    }

    data.x = life;

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
    oFragColor4 = vec4(spawn, 1.0);
}