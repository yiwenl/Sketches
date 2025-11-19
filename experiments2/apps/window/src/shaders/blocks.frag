#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec4 vShadowCoord;
uniform sampler2D uDepthMap;

uniform vec3 uLight;

out vec4 oColor;

float pcfShadow( vec4 sc, sampler2D uDepthMap)
{
    const int s = 2;
    float shadow = 0.0;

    float bias = 0.005;
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
    float diffuse = max(dot(vNormal, uLight), 0.0);
    diffuse = mix(diffuse, 1.0, 0.5);

    vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
    float shadow = pcfShadow(shadowCoord, uDepthMap);
    shadow = mix(0.2, 1.0, shadow);

    diffuse *= shadow;

    oColor = vec4(diffuse, diffuse, diffuse, 1.0);
}