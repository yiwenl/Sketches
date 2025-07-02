#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;

layout (location = 0) out vec4 oColor0;
layout (location = 1) out vec4 oColor1;
layout (location = 2) out vec4 oColor2;
layout (location = 3) out vec4 oColor3;

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 vel = texture(uVelMap, vTextureCoord).xyz;
    vec3 extra = texture(uExtraMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;

    pos.y += extra.x * 0.01;
    float r = 3.0;
    if(pos.y > r) {
        pos.y  -= r * 2.0;
    }
    

    oColor0 = vec4(pos, 1.0);
    oColor1 = vec4(vel, 1.0);
    oColor2 = vec4(extra, 1.0);
    oColor3 = vec4(data, 1.0);
}