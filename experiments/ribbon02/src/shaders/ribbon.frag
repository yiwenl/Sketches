#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vColor;
in vec4 vShadowCoord;
in float vSkip;
in float vDist;

uniform sampler2D uDepthMap;
uniform vec3 uLight;
uniform vec3 uRibbonColor;
uniform vec3 uSkipColor;

out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)
float samplePCF3x3( vec4 sc )
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
    // if(vSkip > 0.5) discard;
    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = samplePCF3x3(shadowCoord);
    s = mix(s, 1.0, .75);

    float d = diffuse(vNormal, uLight, .5);
    d = pow(d, 1.5) * 1.215;
    vec3 color = vColor * uRibbonColor * d * s;
    // color = smoothstep(vec3(0.0), vec3(1.0), color) * 1.25;


    oColor = vec4(color, 1.0);
    float damp = 0.8;
    float fade = smoothstep(0.2, 0.1, vDist);
    vec3 skipTint = mix(uSkipColor, vec3(1.0), fade) * damp;
    if(vSkip > 0.5) oColor *= vec4(skipTint, 1.0);

    if(vDist > 0.5) discard;
}