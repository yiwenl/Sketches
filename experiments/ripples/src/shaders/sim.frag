#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uPosOrgMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uDensityMap;
uniform sampler2D uFluidMap;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform float uTime;
uniform float uNoiseStrength;
uniform float uPlaneSize;
uniform float uFluidStrength;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

#pragma glslify: snoise = require(glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(glsl-utils/curlNoise.glsl)

vec2 getScreenCoord(vec3 pos) {
    vec2 uv = pos.xz;
    uv = uv/uPlaneSize * .5 + .5;
    uv = clamp(uv, vec2(0.0), vec2(1.0));

    return uv;
}

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    float life = data.x;
    

    vec3 acc = vec3(0.0);

    float n = snoise(pos * 1.4 + uTime * 0.2) * 0.5 + 0.5;
    float posOffset = n * 0.5;

    vec3 noise = curlNoise(pos * posOffset);
    noise.y = noise.y * 0.5 + 0.6;
    noise.y *= 4.0;

    acc += noise * uNoiseStrength;

    float speedOffset = mix(1.0, 1.2, extra.y);
    vel += acc * speedOffset * 0.001;

    // fluid
    vec2 uvScreen = getScreenCoord(pos);
    float density = clamp(texture(uDensityMap, uvScreen).x, 0.0, 1.0);
    density = mix(density, 1.0, 0.92);
    vec3 vFluid = texture(uFluidMap, uvScreen).xzy;
    vFluid *= 0.002;
    vel += vFluid * 0.02 * speedOffset * density;

    // volume
    vel += (extra - 0.5) * 0.0001;

    pos += vel;
    vel *= 0.95;
    pos.y = max(pos.y, 0.0);

    float minRadius = 0.5;
    if(length(pos.xz) < minRadius) {
        pos.xz = normalize(pos.xz) * minRadius;
    }

    life -= mix(1.0, 2.0, data.y) * 0.01;

    if(life < 0.0) {
        life = 1.0;
        pos = posOrg;
        vel = normalize(posOrg) * mix(0.05, 0.1, extra.y) * 0.1;
        // vel *= 0.0;
    }


    data.x = life;
    data.z = length(vFluid);

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}