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

uniform float uTime;
uniform float uNoiseScale;
uniform float uSpeed;
uniform vec3 uTouch;
uniform vec3 uCenter;
uniform float uOffset;
uniform float uLifeDecrease;


layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise = require(./glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(./glsl-utils/curlNoise.glsl)

#define PI 3.1415926535897932384626433832795
#define minY -3.5

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    float posOffset = snoise(vec3(pos + uTime * 0.2)) * .5 + .5;
    posOffset = mix(1.0, 2.0, posOffset) * 0.1;

    vec3 acc = vec3(0.0);
    vec3 noise = curlNoise(pos * posOffset - uTime * 0.1);
    acc += noise;

    vec3 dir;
    float f;

    f = 0.25;
    float s = 0.75;
    vec3 posAdj = pos * vec3(s, 1.0, s);
    float maxRadius = mix(4.0, 2.0, extra.z);
    float d = distance(posAdj, uCenter);

    // pulling force
    dir = -normalize(posAdj - uCenter);
    f = smoothstep(maxRadius - 1.0, maxRadius, d);
    acc += dir * f * 2.0;

    if(pos.y < minY) {
        acc.y += (minY - pos.y) * 0.1;
    }

    

    // repel to touch
    d = distance(pos, uTouch);
    f = smoothstep(5.0, 3.0, d);
    dir = normalize(pos - uTouch);

    float fTime = fract(extra.x + extra.y);
    float time = uTime * mix(1.0, 2.0, fTime) * 0.5 + extra.z * PI;
    fTime = smoothstep(-0.5, 1.0, sin(time));
    acc -= dir * f * fTime * mix(0.5, 2.0, fract(extra.y + extra.z)) * 2.0;
    
    float speed = mix(2.0, 3.0, extra.x);
    // float speed = mix(2.0, 4.0, extra.x);

    float t = fract(extra.x + extra.y);
    if( t < 0.015) speed *= mix(4.0, 8.0, t);
    vel += acc * speed * 0.0003;

    pos += vel;
    vel *= .96;

    pos.y = max(pos.y, minY);


    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}