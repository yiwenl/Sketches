#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uPosOrgMap;
uniform float uTime;
uniform float uSeed;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    float life = data.x;
    float lifeDecr = mix(1.0, 2.0, data.y) * 0.005;
    life -= lifeDecr;

    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;

    vec3 dir = normalize(pos);
    pos += dir * mix(1.0, 1.2, extra.x) * 0.001;


    vec3 acc = vec3(0.0);
    float posOffset = snoise(pos * 0.1 + uTime * 0.2 + uSeed) * .5 + .5;
    posOffset = mix(0.1, 0.5, posOffset);

    vec3 noise = curlNoise(pos * posOffset + uTime * 0.1 + uSeed);
    noise.z *= 0.4;
    acc += noise;

    // float speed = mix(1.0, 1.5, extra.y) * 0.0008;
    float speed = mix(1.0, 1.5, extra.y) * 0.002;
    vel += acc * speed;
    pos += vel;
    vel *= 0.92;


    if(life < 0.0) {
        life = 1.0;
        pos = posOrg;
    }

    data.x = life;

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);

}