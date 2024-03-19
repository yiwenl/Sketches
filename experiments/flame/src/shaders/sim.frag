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

    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;

    float life = data.x;
    life -= mix(1.0, 3.0, extra.y) * 0.004;

    vec3 acc = vec3(0.0);

    vec2 uv = pos.xy / uBound * .5 + .5;
    vec3 fluid = texture(uFluidMap, uv).xyz;
    float density = texture(uDensityMap, uv).x;
    density = mix(0.5, 1.0, density);
    acc += fluid * 0.001 * density;


    // noise
    vec3 noise = curlNoise(pos * 0.5);
    noise.xy *= 0.01;
    acc += noise;

    // pull back to center
    acc.z -= pos.z * 0.05;

    vel += acc;
    float speed = mix(1.0, 3.0, extra.x) * 0.0005;

    float initSpeed = smoothstep(.9, .6, life);
    pos += vel * speed * initSpeed;
    vel *= .96;


    if(life <= 0.0) {
        life = 1.0;
        pos = posOrg;
    }
    data.x = life;


    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}