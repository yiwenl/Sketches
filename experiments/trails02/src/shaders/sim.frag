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
uniform vec3 uCenter;


#pragma glslify: curlNoise = require(glsl-utils/curlNoise.glsl)

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

    acc += noise;

    dir = normalize((pos - center) * vec3(1.0, 1.0, 0.0));
    float speed = mix(1.0, 2.0, extra.g);
    acc += dir * 1.5;
    vel += acc * 0.00035 * speed;

    if(life > 0.0) {
        pos += vel;
    }

    float decreaseRate = 0.96;
    vel *= decreaseRate;


    life -= mix(0.01, 0.02, extra.b) * 0.75;
    if(life < -0.75) {
        // respwan
        life = 1.0;
        pos = orgPos + uCenter;
        vel *= 0.0;
        center = uCenter;
    }
    

    data.x = life;

    gl_FragData[0] = vec4(pos, 1.0);
    gl_FragData[1] = vec4(vel, 1.0);
    gl_FragData[2] = vec4(extra, 1.0);
    gl_FragData[3] = vec4(data, 1.0);
    gl_FragData[4] = vec4(center, 1.0);
}