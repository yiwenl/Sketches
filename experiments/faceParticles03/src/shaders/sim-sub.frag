#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform sampler2D uPosOrgMap;
uniform sampler2D uFaceMap;

// fluid
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;

// uniform mat4 uCameraMatrix;

uniform float uBound;
uniform float uTime;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;
layout (location = 4) out vec4 oFragColor4;

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;
    vec3 posOrg = texture(uPosOrgMap, vTextureCoord).xyz;

    // uv for fluid
    vec2 uvFluid = pos.xy / uBound * .3 + .5;
    vec3 fluid = texture(uFluidMap, uvFluid).xyz * 0.0001;
    float density = texture(uDensityMap, uvFluid).x;

    // life
    float life = data.x;
    life -= mix(1.0, 3.0, data.z) * 0.005 * mix(1.0, 1.5, density);

    // movement
    vec3 acc = vec3(0.0);
    acc += fluid * density;

    vel += acc * 0.005;

    float speed = mix(1.0, 1.2, extra.x);
    float speedLife = smoothstep(.9, .7, life);
    pos += vel * speed * speedLife;
    vel *= .95;


    if(life <= 0.0) {
        pos = posOrg;
        life = 1.0;
    }

    data.x = life; 

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(vel, 1.0);
    oFragColor2 = vec4(extra, 1.0);
    oFragColor3 = vec4(data, 1.0);
    oFragColor4 = vec4(posOrg, 1.0);
}