#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uDensityMap;

uniform mat4 uCameraMatrix;
uniform float uRatio;
uniform vec3 uHit;
uniform float uRepelForce;
uniform float uPullForce;

uniform float uNum;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)

#define PI 3.1415926535897932384626433832795

float maxRadius = 5.0; 

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    vec3 acc = vec3(0.0);

    // get density
    vec4 screenPos = uCameraMatrix * vec4(pos, 1.0);
    vec2 uv = screenPos.xy / screenPos.w * .5 + .5;
    float density = texture(uDensityMap, uv).r;
    density = smoothstep(0.0, 1.0, density);


    int num = int(uNum);
    // float minDist = mix(0.05, 0.2, density);
    float minDist = mix(0.1, 0.03, density);
    // minDist = mix(0.1, 0.01, density);
    for(int j=0; j<num; j++) {
        for(int i=0; i<num; i++) {
            vec2 uv = vec2(float(i)/uNum, float(j)/uNum);
            vec3 posNeighbor = texture(uPosMap, uv).xyz;
            float d = distance(pos, posNeighbor);
            if(d > 0.0) {
                float f = smoothstep(minDist * 2.0, minDist, d);
                vec3 dir = normalize(pos - posNeighbor);
                acc += f * dir * uRepelForce;
            }
        }
    }

    // pull back to center
    // float d = length(pos * vec3(1.0, uRatio, 1.0));
    vec3 center = uHit * 0.0;
    float d = distance(pos, center);
    // float f = smoothstep(6.0, 14.0, d);
    float f = smoothstep(0.0, 10.0, d);
    vec3 dir = normalize(pos - center);

    acc -= dir * 0.1 * f * uPullForce;
    vel += acc * 0.01;

    pos += vel;

    vel *= 0.96;

    data = vec3(uv, 0.0);
    data = vec3(density);

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}