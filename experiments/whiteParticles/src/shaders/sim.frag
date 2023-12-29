#version 300 es

#define NUM_LINES 40
precision highp float;
in vec2 vTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uPosOrgMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;

uniform float uTime;
uniform float uOffset;
uniform float uLifeDecrease;


layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;
layout (location = 4) out vec4 oFragColor4;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)

#define PI 3.1415926535897932384626433832795

vec2 getScreenUV(vec3 pos) {
    vec4 screenPos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);   
    return screenPos.xy / screenPos.w * .5 + .5;
}

void main(void) {
    bool needUpdate = false;

    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;

    // data.z = mod(data.z + 0.01, PI * 2.0);
    data.z += 0.1;

    float life = data.x;
    life -= mix(1.0, 4.0, data.y) * 0.003 * mix(1.0, 2.0, uLifeDecrease);

    vec3 acc = vec3(0.0);

    // fluid
    vec2 uv = getScreenUV(pos);
    vec3 fluid = texture(uFluidMap, uv).xyz;
    float density = texture(uDensityMap, uv).x;
    density = mix(0.5, 1.0, density);

    // depth noise
    float noise = snoise(vec3(pos * 0.75 + uTime * 0.5 + extra * 0.1));
    acc.z += noise * 30.0 * density;

    acc += fluid * 0.03 * density;


    // apply velocity
    float speed = mix(1.0, 2.0, extra.x);

    float t = pow(uOffset , 3.0);
    vel += acc * speed * 0.0001 * mix(1.0, 1.5, t);
    vel *= 0.9 + uOffset * 0.02;

    pos += vel;

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