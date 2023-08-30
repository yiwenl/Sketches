#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uPosOrgMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;

uniform float uBound;
uniform float uTime;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

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
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;
    float life = data.x;
    life -= mix(1.0, 4.0, data.y) * 0.0025;

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
        pos = posOrg;
        vel = vec3(0.05, (extra.z - 0.5) * 0.02, 0.0);
    }

    data.x = life;

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}