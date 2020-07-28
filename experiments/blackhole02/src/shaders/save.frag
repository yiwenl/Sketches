#version 300 es

precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec3 vData;

#pragma glslify: curlNoise = require(glsl-utils/curlNoise.glsl)

layout (location = 0) out vec4 oFragColor0;
layout (location = 1) out vec4 oFragColor1;
layout (location = 2) out vec4 oFragColor2;
layout (location = 3) out vec4 oFragColor3;
layout (location = 4) out vec4 oFragColor4;

void main(void) {
    oFragColor0 = vec4(vPosition, 1.0);
    oFragColor1 = vec4(vec3(0.0), 1.0);
    oFragColor2 = vec4(vNormal, 1.0);
    oFragColor3 = vec4(vData, 1.0);

    float gap = 2.5;
    vec3 adjustedPos = floor(vPosition/gap) * gap;
    vec3 pos = curlNoise(adjustedPos + vNormal * 0.015);
    float l = mix(0.9, 1.0, pow(vData.z, 2.0));
    pos = normalize(pos) * length(vPosition) * l;


    oFragColor4 = vec4(pos, 1.0);
}