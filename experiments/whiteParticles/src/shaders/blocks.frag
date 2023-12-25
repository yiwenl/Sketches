#version 300 es

precision highp float;
in vec3 vNormal;
in vec3 vColor;
in vec4 vShadowCoord;

uniform sampler2D uDepthMap;
uniform sampler2D uNoiseMap;
uniform vec3 uLight;
uniform vec3 uColorShadow;
uniform vec3 uColorDiffuse;
uniform vec2 uResolution;

out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
#define LIGHT vec3(0.1, 0.6, 0.6)

float samplePCF3x3( vec4 sc )
{
    vec2 uv = gl_FragCoord.xy/uResolution;
    float noise = texture(uNoiseMap, uv).r;
    const int s = 2;
    float shadow = 0.0;

    float bias = 0.004 + noise * 0.002;
    float threshold = sc.z - bias;


    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2(-s,-s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2(-s, 0) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2(-s, s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( 0,-s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( 0, 0) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( 0, s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( s,-s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( s, 0) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( s, s) ).r);
    return shadow/9.0;
}

void main(void) {
    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = samplePCF3x3(shadowCoord);

    vec3 colorShadow    = mix(uColorShadow, vec3(1.0), s);
    
    vec3 color = vColor * colorShadow;
    float g = diffuse(vNormal, uLight);
    vec3 colorDiffuse = mix(uColorDiffuse, vec3(1.0), g);

    color *= colorDiffuse;
    oColor = vec4(color, 1.0);
}