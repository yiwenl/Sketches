#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uBgMap;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uSeeds;
uniform float uTime;

#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    // get screen uv
    vec4 screenPos = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);
    vec2 uv = screenPos.xy / screenPos.w * 0.5 + 0.5;
    float g = texture(uBgMap, uv).r;

    vec3 acc = vec3(0.0);

    // Noise
    float noiseScale = mix(0.3, 0.7, g);
    vec3 noise = curlNoise(pos * noiseScale + uTime * 0.1 + uSeeds.x);
    acc += noise * 0.015 * mix(1.0, 2.0, extra.z);


    // Pull back 
    float maxRadius = mix(5.0, 2.0, g);
    float minRadius = maxRadius - mix(1.0, 2.0, extra.y);
    float dist = length(pos);   
    float f = smoothstep(minRadius, maxRadius, dist);
    f = pow(f, 3.0);
    vec3 dir = normalize(pos);
    float pullForce = mix(1.0, 1.5, g);
    acc -= dir * f * 0.025 * mix(0.5, 1.0, extra.z) * pullForce;

    float speed = mix(1.0, 3.0, extra.x) * 0.01;
    speed *= mix(3.0, 1.0, g);
    vel += acc * speed;

    pos += vel;
    vel *= 0.96;

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
}