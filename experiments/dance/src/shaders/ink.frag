#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uFluidMap;
uniform sampler2D uDensityMap;
uniform sampler2D uVoronoiMap;

uniform float uSeed;
uniform vec3 uSeeds;
uniform float uRatio;
uniform float uTime;

out vec4 oColor;

#define DECREASE_RATE 0.93

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)
#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)
#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    vec2 uv = vTextureCoord;
    vec2 _uv = vTextureCoord;
    _uv.y /= uRatio;

    vec2 fluid = normalize(texture(uFluidMap, uv).rg);
    float density = texture(uDensityMap, uv).r;
    vec3 voronoi = texture(uVoronoiMap, uv).rgb;
    fluid *= mix(0.5, 1.0, density);


    float scale = 50.0;
    float noise = snoise(vec3(_uv.yx, uSeeds.z) * scale - uTime) * .5 + .5;
    float nx = fbm(vec3(_uv, uSeeds.x) * scale + uTime) - 0.5;
    float ny = fbm(vec3(uSeeds.y, _uv.yx) * scale + uTime) - 0.5;
    fluid += vec2(nx, ny) * 0.5;

    scale = 200.0;
    nx = fbm(vec3(_uv.yx, uSeeds.x) * scale + uTime) - 0.5;
    ny = fbm(vec3(uSeeds.y, _uv) * scale + uTime) - 0.5;
    fluid += vec2(nx, ny) * 1.2;

    // uv += fluid * 0.01 * mix(0.5, 1.0, voronoi.z);
    uv += fluid * 0.01;

    vec3 color = texture(uMap, uv).rgb;
    color *= DECREASE_RATE;

    color += density * mix(0.1, 0.2, voronoi.x);

    oColor = vec4(color, 1.0);
    // oColor = vec4(fluid, 0.0, 1.0);
}