// copy.frag
#extension GL_EXT_draw_buffers : require 
precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureExtra;
uniform sampler2D textureData;
uniform sampler2D textureOrgPos;
uniform sampler2D textureVelMap;
uniform sampler2D textureDensityMap;


uniform float uTime;
uniform float uSize;
uniform float uSpeed;

#pragma glslify: curlNoise    = require(glsl-utils/curlNoise.glsl)

void main(void) {
    vec3 pos = texture2D(texturePos, vTextureCoord).xyz;
    vec3 vel = texture2D(textureVel, vTextureCoord).xyz;
    vec3 extra = texture2D(textureExtra, vTextureCoord).xyz;
    vec3 data = texture2D(textureData, vTextureCoord).xyz;
    vec3 orgPos = texture2D(textureOrgPos, vTextureCoord).xyz;


    vec2 uv = pos.xy / uSize * .5 + .5;
    // vec3 acc = normalize(texture2D(textureVelMap, uv).xyz);
    vec3 acc = texture2D(textureVelMap, uv).xyz * 0.005;
    float density = texture2D(textureDensityMap, uv).r;

    vec3 noise = curlNoise(pos * 0.5 + vec3(0.0, 0.0, uTime * 0.1));
    noise.xy *= 0.0;
    acc += noise * 5.0;

    
    vel += acc * 0.0001 * uSpeed;
    pos += vel;
    vel *= 0.925;

    // vel = normalize(acc);

    float life = data.x;
    float strength = density < 0.01 ? 2.0 : 0.5;

    life -= mix(1.0, 2.0, extra.z) * 0.005 * strength;

    if(life <= 0.0) {
        life = 1.0;
        pos = orgPos;
        vel *= 0.0;
    }


    if(density > 0.01) {
        data.y += 0.1;
        data.y = min(1.0, data.y);
    } else {
        data.y *= 0.9;
    }

    data.x = life;

    // pos.y += 0.01;

    gl_FragData[0] = vec4(pos, 1.0);
    gl_FragData[1] = vec4(vel, 1.0);
    gl_FragData[2] = vec4(extra, 1.0);
    gl_FragData[3] = vec4(data, 1.0);
}