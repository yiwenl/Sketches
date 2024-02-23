#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uColorMap;
uniform sampler2D uPosOrgMap;

uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;

uniform vec3 uCenters[2];
uniform vec2 uBound;
uniform float uTime;

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
    vec3 color = texture(uColorMap, vTextureCoord).xyz;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;

    float life = data.x;
    life -= mix(1.0, 3.0, extra.z) * 0.005;

    float r = uBound.y;
    vec2 uv = pos.xy / r * .5 + .5;
    vec3 fluid = texture(uFluidMap, uv).xyz;
    float density = smoothstep(0.0, 1.0, texture(uDensityMap, uv).x);
    density = mix(0.75, 1.0, density);

    // noise
    vec3 noise = curlNoise(pos * 2.1 + uTime * 0.1) * 0.02;
    noise.z *= 5.0;


    vec3 acc = fluid * 0.0004 * density + noise;
    acc.z -= normalize(pos.z) * 0.01;

    float ratio = uBound.x / uBound.y;
    vec3 dir = normalize(pos * vec3(1.0, 1.0, 0.0));
    vec2 p = abs(pos.xy);
    p.y *= ratio;
    float f = length(p);
    f = smoothstep(3.5, 4.5, f);
    acc -= dir * f * 2.0;

    // avoidance
    for(int i=0; i<2; i++) {
        vec3 oCenter = uCenters[i];
        vec2 center = oCenter.xy + (extra.xy -0.5) * 0.1;
        f = distance(pos.xy, center);
        vec2 dir2 = normalize(pos.xy - center);
        f = smoothstep(oCenter.z + 2.0, oCenter.z, f);
        acc.xy += dir2 * f * mix(0.4, 1.0, extra.z);
    }


    // apply force
    float speed = mix(1.0, 4.0, extra.x);
    vel += acc * 0.003;
    pos += vel * speed;
    vel *= .9;


    // check bound
    if(pos.x < -uBound.x) {
        pos.x = -uBound.x;
        vel.x = abs(vel.x);
    } else if(pos.x > uBound.x) {
        pos.x = uBound.x;
        vel.x = -abs(vel.x);
    }

    if(pos.y < -uBound.y) {
        pos.y = -uBound.y;
        vel.y = abs(vel.y);
    } else if(pos.y > uBound.y) {
        pos.y = uBound.y;
        vel.y = -abs(vel.y);
    }

    if(pos.z < 0.0) {
        pos.z = 0.0;
        vel.z = abs(vel.z);
    }

    if(life < 0.0) {
        pos = posOrg;
        vel = vec3(0.0);
        life = 1.0;
    }

    life = 0.5;
    data.x = life;

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
    oFragColor4 = vec4(color, 1.0);
}