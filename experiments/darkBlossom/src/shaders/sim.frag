#version 300 es

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

uniform float uTime;
uniform float uFloor;
uniform float uEmitStrength;
uniform float uResetSpeed;
uniform vec3 uTouch;


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

    float timestep = 1.5;

    float isFlying = data.x;
    float rotation = data.y;
    float resetCount = data.z;

    vec3 acc = vec3(0.0, -.5, 0.0);

    // noise
    float posOffset = snoise(pos * 0.5 + uTime * 0.2) * .5 + .5;
    float t = posOffset;
    posOffset = mix(2.0, 3.0, posOffset) * 0.02;
    vec3 noise = curlNoise(pos * posOffset - uTime * 0.1);
    noise.y -= 0.5;
    acc += noise * 0.5 * isFlying;

    // roatate
    float distToTouch = distance(pos, uTouch);

    // float initSpeed = smoothstep(1.0, .95, life);
    float speed = mix(1.0, 2.0, extra.x);
    vel += acc * speed * 0.001 * timestep * isFlying;

    // float rotSpeed = smoothstep(.9, .7, life);
    float rotSpeed = 0.1;
    rotation += mix(1.0, 3.0, extra.z) * rotSpeed * isFlying; 

    pos += vel;
    vel *= 0.94;
    

    if(isFlying < 0.5) {
        // pos = posOrg;
        float v = fract(extra.x + extra.y + uTime) * .5 + .5;
        v *= smoothstep(2.0 + t * 1.5, 0.0, distToTouch) * uEmitStrength;
        vel = vec3(0.0, v * .85, 0.0);

        float t = fract(extra.y + extra.z);
        vec3 dir = normalize((pos - uTouch) * vec3(1.0, 0.0, 1.0));
        vel.xz = dir.xz * 0.2 * v * mix(1.0, 2.0, t);
        
        if(v > 0.0) {
            isFlying = 1.0;
            rotation = 0.0;
        }
    }

    if(pos.y < posOrg.y) {
        isFlying = 0.0;
        rotation = 0.0;
        pos.y = posOrg.y;
    }

    if(isFlying < 0.5) {
        resetCount += 1.0;
        if(resetCount > mix(6000.0, 10000.0, extra.z)/uResetSpeed) {
            resetCount = 0.0;
            pos = posOrg;
        }
    }

    rotation = mix(0.0, rotation, isFlying);

    data.x = isFlying;
    data.y = rotation;
    data.z = resetCount;


    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}