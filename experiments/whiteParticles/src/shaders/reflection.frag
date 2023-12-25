#version 300 es

precision highp float;

in vec2 vTextureCoord;
uniform sampler2D uNormalMap;
uniform sampler2D uNoiseMap;

uniform vec3 uColor;
uniform vec3 uLight;

out vec4 oColor;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)

#define PI 3.1415926535897932384626433832795

void main(void) {
    vec2 uv = vTextureCoord;
    float n = texture(uNoiseMap, uv).r;

    vec3 normal = texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0;

    float g = diffuse(normal, uLight) * n;

    g = pow(g, .75);

    oColor = vec4(uColor, g * 0.4);
}