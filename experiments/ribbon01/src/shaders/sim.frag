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

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    float posOffset = snoise(vec3(pos + uTime * 5.5)) * .5 + .5;
    posOffset = mix(2.2, 2.0, posOffset) * 0.12 * uNoiseScale;

    vec3 acc = vec3(0.0);
    vec3 noise = curlNoise(pos * posOffset - uTime * 0.3);
    acc += noise;

    vec3 dir;
    float f;

    f = 0.25;
    float maxRadius = mix(2.0, 2.2, extra.z) - f;
    maxRadius += step(2.0, uSpeed) * (0.5 + f);
    float d = distance(pos, uCenter);

    // pulling force
    dir = -normalize(pos - uCenter);
    f = smoothstep(maxRadius - 1.0, maxRadius, d);
    acc += dir * f * 2.0;
    

    // repel to touch
    d = distance(pos, uTouch);
    f = smoothstep(3.0, 0.0, d);
    dir = normalize(pos - uTouch);
    acc -= dir * f * mix(1.5, 1.0, extra.y);
    
    float speed = mix(2.0, 3.0, extra.x);
    // float speed = mix(2.0, 4.0, extra.x);

    float t = fract(extra.x + extra.y );
    if( t < 0.01) speed *= mix(4.0, 8.0, t);
    vel += acc * speed * 0.0002 * uSpeed;

    pos += vel;
    vel *= .96;


    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}