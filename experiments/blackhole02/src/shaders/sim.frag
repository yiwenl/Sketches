#version 300 es

#define NUM_HOLES ${numHoles}

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureExtra;
uniform sampler2D textureData;
uniform sampler2D texturePosOrg;

uniform vec3 uHoles[NUM_HOLES];
uniform float uTime;

#pragma glslify: snoise = require(glsl-utils/snoise.glsl)
#pragma glslify: curlNoise = require(glsl-utils/curlNoise.glsl)
#pragma glslify: rotate = require(glsl-utils/rotate.glsl)

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;
layout (location = 4) out vec4 oFragColor4;

void main(void) {
    vec3 pos = texture(texturePos, vTextureCoord).xyz;
    vec3 vel = texture(textureVel, vTextureCoord).xyz;
    vec3 extra = texture(textureExtra, vTextureCoord).xyz;
    vec3 data = texture(textureData, vTextureCoord).xyz;
    vec3 posOrg = texture(texturePosOrg, vTextureCoord).xyz;

    float rotSpeed = 0.01;
    posOrg.xz = rotate(posOrg.xz, rotSpeed);
    posOrg.yz = rotate(posOrg.zy, -rotSpeed);

    float life = data.x;
    life -= mix(0.5, 1.0, data.y) * 0.02;

    vec3 acc = vec3(0.0);
    float posOffset = 0.5;

    vec3 adjustedPos = pos;
    float gap = 1.0;
    adjustedPos = floor(adjustedPos * gap) / gap;
    vec3 noise = curlNoise(adjustedPos * posOffset + uTime * 0.1);
    acc += noise * 0.5;

    // avoiding holes 

    for(int i=0; i<NUM_HOLES; i ++) {
        vec3 c = uHoles[i];
        vec3 dir = normalize(pos - c);
        float d = distance(pos, c);
        float f = smoothstep(2.0, 0.0, d);
        acc += dir * f * 2.0;
    }


    // pulling back to center
    const float maxRadius = 1.5;
    float dist = length(pos);
    float f = smoothstep(0.5, 2.0, dist);
    vec3 dir = normalize(pos);
    acc -= dir * f;


    float speedOffset = mix(0.95, 1.0, extra.r);
    float initSpeedOffset = mix(1.0, 0.5, life);
    initSpeedOffset = mix(initSpeedOffset, 1.0, .1);
    vel += acc * 0.003 * speedOffset * initSpeedOffset;

    pos += vel;
    vel *= 0.95;
    
    if(life <= 0.0) {
        life = 1.0;
        pos = posOrg;
        vel = vec3(0.0);
    }
    data.x = life;
    
    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
    oFragColor4 = vec4(posOrg, 1.0);
}