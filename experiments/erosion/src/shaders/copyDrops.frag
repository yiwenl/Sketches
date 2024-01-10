#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uPosMap;
uniform sampler2D uDataMap;
// uniform sampler2D uExtraMap;

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
// layout (location = 2) out vec4 oFragColor2;

void main(void) {
    vec3 pos = texture(uPosMap, vTextureCoord).xyz;
    vec3 data = texture(uDataMap, vTextureCoord).xyz;
    // vec3 extra = texture(uExtraMap, vTextureCoord).xyz;

    oFragColor0 = vec4(pos, 1.0);
    oFragColor1 = vec4(data, 1.0);
    // oFragColor2 = vec4(extra, 1.0);
}