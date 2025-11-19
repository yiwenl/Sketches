#version 300 es

precision highp float;
in vec3 vColor;
in vec4 vShadowCoord;
uniform sampler2D uDepthMap;

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
    if(distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;

    vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
    float shadow = pcfShadow(shadowCoord, uDepthMap);
    shadow = mix(0.4, 1.0, shadow);

    oColor = vec4(vec3(shadow), 1.0);
}