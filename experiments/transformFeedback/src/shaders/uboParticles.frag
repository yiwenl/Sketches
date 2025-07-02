#version 300 es

precision highp float;
in vec3 vColor;
in vec3 vNormal;
in vec3 vPosition;
in vec4 vShadowCoord;

uniform sampler2D uDepthMap;
uniform vec3 uLight;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#pragma glslify: pcfShadow    = require(./glsl-utils/pcfShadow.glsl)
#define LIGHT vec3(1.0, 0.8, 0.6)

// out vec4 oColor;

layout(location = 0) out vec4 oPosition;
layout(location = 1) out vec4 oNormal;
layout(location = 2) out vec4 oColor;
layout(location = 3) out vec4 oLight;

void main(void) {
    float s = pcfShadow(vShadowCoord, uDepthMap);
    float d = diffuse(vNormal, uLight, .5);
    // s *= d;
    // s = mix(0.2, 1.0, s);
    vec3 color = pow(vColor + 0.3, vec3(1.5)) * 1.3;
    // oColor = vec4(color * s, 1.0);

    oPosition = vec4(vPosition, 1.0);
    oNormal = vec4(vNormal, 1.0);
    oColor = vec4(vColor, 1.0);
    oLight = vec4(s, d, 0.0, 1.0);
}