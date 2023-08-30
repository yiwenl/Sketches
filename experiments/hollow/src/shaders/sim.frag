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

uniform float uPlaneSize;
uniform float uTime;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

#define PI 3.141592653

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).rgb;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).rgb;
    vec3 vel = texture(uVelMap, vTextureCoord).rgb;
    vec3 extra = texture(uExtraMap, vTextureCoord).rgb;
    vec3 data = texture(uDataMap, vTextureCoord).rgb;

    float life = data.x;
    life -= mix(1.0, 3.0, data.y) * 0.01;


    // uv 
    vec2 uv = pos.xy / uPlaneSize * .5 + .5;


    vec3 noise = curlNoise(pos * 0.5 + uTime);

    vec3 fluid = normalize(texture(uFluidMap, uv).rgb);
    vel += fluid * 0.00025;
    vel += noise * .00005;
    vel *= 0.98;


    float initSpeed = smoothstep(1.0, 0.8, life);
    pos += vel * mix(1.0, 2.0, extra.x) * initSpeed;


    if(life <= 0.0) { 
        pos = posOrg;
        life = 1.0;
        vel *= 0.0;
    }

    data.x = life;
    
    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    // oFragColor2 = vec4(extra, 1.0);
    oFragColor2 = vec4(uv, 0.0, 1.0);
    oFragColor3 = vec4(data, 1.0);
}