#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uColorMap;

uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;
uniform sampler2D uFaceMap;

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

    float r = uBound.y;
    vec2 uv = pos.xy / r * .5 + .5;
    vec3 fluid = texture(uFluidMap, uv).xyz;
    float density = smoothstep(0.0, 1.0, texture(uDensityMap, uv).x);
    density = mix(0.75, 1.0, density);

    // noise
    vec3 noise = curlNoise(pos * 1.5 + uTime * 0.1) * 0.1;
    noise.xy *= 0.01;
    noise.z *= 3.0;


    vec3 acc = fluid * 0.0004 * density + noise;
    acc.z -= normalize(pos.z) * 0.0002;

    vec3 dir = normalize(pos * vec3(1.0, 1.0, 0.0));
    float f = length(pos.xy);
    f = smoothstep(1.5, 3.0, f);
    acc -= dir * f * 0.5;

    // face bound
    uv = pos.xy / uBound * .5 + .5;
    vec4 colorFace = texture(uFaceMap, uv);
    float maxDepth = colorFace.z + 0.8;
    if(colorFace.a <= 0.0) {
        maxDepth = 0.0;

        vec3 dir = normalize(pos);
        float d = length(pos * vec3(1.0, 0.25, 1.0));
        float f = smoothstep(1.0, 3.0, d);
        acc -= dir * f * 0.5;

        acc.z -= normalize(pos.z) * 0.002;
        pos.z = 0.0;
    }

    // if(pos.z > maxDepth) {
    //     pos.z = maxDepth;
    //     vel.z = -abs(vel.z);
    // }
    // pos.z = min(maxDepth, pos.z);


    float speed = mix(1.0, 4.0, extra.x);
    vel += acc * 0.005;
    pos += vel * speed;
    vel *= .95;


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

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
    oFragColor4 = vec4(color, 1.0);
}