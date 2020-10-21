// copy.frag

#extension GL_EXT_draw_buffers : require 

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureExtra;
uniform sampler2D textureData;
uniform sampler2D textureCenter;
uniform sampler2D textureOrgPos;

uniform float uNoiseScale;
uniform float uTime;
uniform float uNumFrames;
uniform float uSpeed;
uniform vec3 uCenter0;
uniform vec3 uCenter1;


#pragma glslify: curlNoise = require(glsl-utils/curlNoise.glsl)
#pragma glslify: rotate = require(glsl-utils/rotate.glsl)
#define PI 3.141592653

void main(void) {
    vec3 pos = texture2D(texturePos, vTextureCoord).xyz;
    vec3 vel = texture2D(textureVel, vTextureCoord).xyz;
    vec3 extra = texture2D(textureExtra, vTextureCoord).xyz;
    vec3 data = texture2D(textureData, vTextureCoord).xyz;
    vec3 center = texture2D(textureCenter, vTextureCoord).xyz;
    vec3 orgPos = texture2D(textureOrgPos, vTextureCoord).xyz;

    float life = data.x;

    vec3 dir;
    vec3 acc = vec3(0.0);
    vec3 noise = curlNoise(pos * uNoiseScale * vec3(1.0, 1.0, 3.0) + vec3(0.0, 0.0, uTime * 0.1));
    noise.z *= 2.0;

    acc += noise * 1.5;

    dir = normalize((pos - center) * vec3(1.0, 1.0, 0.0));
    float speed = mix(1.0, 2.0, extra.g);
    acc += dir * 1.5;


    // // rotate
    // dir.xy = rotate(dir.xy, PI * 0.7);
    // acc += dir * mix(1.0, 1.5, extra.b);

    vel += acc * 0.0005 * speed * uSpeed;

    if(life > 0.0) {
        pos += vel;
    }

    float decreaseRate = 0.96;
    vel *= decreaseRate;


    life -= mix(0.01, 0.02, extra.b) * 0.75;
    float maxLife = 0.02 * 0.75 * uNumFrames;
    if(life < -maxLife) {
        // respwan
        vec3 newCenter = extra.r > 0.5 ? uCenter0 : uCenter1;
        life = 1.0;
        pos = orgPos + newCenter;
        vel *= 0.0;
        center = newCenter;
    }

    data.x = life;

    gl_FragData[0] = vec4(pos, 1.0);
    gl_FragData[1] = vec4(vel, 1.0);
    gl_FragData[2] = vec4(extra, 1.0);
    gl_FragData[3] = vec4(data, 1.0);
    gl_FragData[4] = vec4(center, 1.0);
}