#version 300 es

precision highp float;
in vec3 vNormal;
in vec3 vColor;
in vec4 vShadowCoord;

uniform vec3 uLight;
uniform sampler2D uDepthMap;

out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#pragma glslify: pcfShadow    = require(./glsl-utils/pcfShadow.glsl)

#define MONOCOLOR vec3(1.0, .97, .94)

void main(void) {
    float g = diffuse(vNormal, uLight, .5);
    float s = pcfShadow(vShadowCoord/vShadowCoord.w, uDepthMap, .5);
    oColor = vec4(vColor * g * s * 1.5 * MONOCOLOR, 1.0);
}