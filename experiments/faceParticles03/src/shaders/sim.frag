#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uPosOrgMap;
uniform sampler2D uFaceMap;

// fluid
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;

// uniform mat4 uCameraMatrix;

uniform float uBound;
uniform float uTime;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;
layout (location = 4) out vec4 oFragColor4;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: _normalize = require(./glsl-utils/_normalize.glsl)

#define PI 3.141592653
#define FACE_BOUND 3.0


vec2 contrast(vec2 v, float s) {
    return (v - 0.5) * s + 0.5;
}

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;

    // uv for fluid
    vec2 uvFluid = pos.xy / uBound * .5 + .5;
    vec3 fluid = texture(uFluidMap, uvFluid).xyz * 0.0001;
    float density = texture(uDensityMap, uvFluid).x;

    // life
    float life = data.x;
    life -= mix(1.0, 3.0, data.z) * 0.005 * mix(1.0, 1.5, density);
    if(fract(extra.x + extra.y) < 0.1) {
        life -= 0.01;
    }

    // movement
    vec3 acc = vec3(0.0);
    acc += fluid * density;

    vel += acc * 0.003;

    float speed = mix(1.0, 2.0, extra.x);
    float speedLife = smoothstep(.9, .7, life);
    pos += vel * speed * speedLife;
    vel *= .98;


    // respawn pos

    vec2 uvFace = fract(extra.xy + uTime * mix(1.0, 5.0, extra.z));
    // float a = extra.x * PI * 2.0;
    // float r = pow(fract(extra.y) * 0.5, mix(1.0, 1.3, extra.z));
    // uvFace = vec2(cos(a) * r + 0.5, sin(a) * r + 0.5);
    vec4 colorMap = texture(uFaceMap, uvFace);
    posOrg = colorMap.xyz;

    if(life <= 0.0) {
        pos = posOrg;
        life = 1.0;
        if(colorMap.a <= 0.5) {
            life = 0.0;
        }
    }


    data.x = life; 


    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
    oFragColor4 = vec4(posOrg, 1.0);
}