#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vColor;
in vec4 vShadowCoord;
in float vSkip;
in float vDist;
in vec3 vWsPos;
in vec3 vExtra;

uniform sampler2D uDepthMap;
uniform vec3 uLight;
uniform vec3 uRibbonColor;
uniform vec3 uSkipColor;
uniform float uLightFalloff;
uniform float uLightFalloffStart;

out vec4 oColor;

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
    return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

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
    vec3 shadowColor = mix(vec3(0.74, 0.74, 0.73), vec3(1.0), s);

    float d = diffuse(vNormal, uLight, .5);
    float lightDist = distance(vWsPos, uLight);
    float falloffDist = max(lightDist - uLightFalloffStart, 0.0);
    float falloff = 1.0 / (1.0 + falloffDist * uLightFalloff);
    vec3 color = vColor * uRibbonColor * d * shadowColor * falloff;

    oColor = vec4(color, 1.0);
    float damp = 0.8;
    float fade = smoothstep(0.2, 0.1, vDist);
    float dHue = 0.03;
    float hueOffset = mix(-dHue, dHue, fract(vExtra.x + vExtra.y));
    vec3 skipHsv = rgb2hsv(uSkipColor);
    skipHsv.x = fract(skipHsv.x + hueOffset);
    float br = mix(1.0, 1.3, fract(vExtra.y + vExtra.z));
    vec3 skipColor = hsv2rgb(skipHsv) * br;
    vec3 skipTint = mix(skipColor, vec3(1.0), fade) * damp;
    if(vSkip > 0.5) oColor *= vec4(skipTint, 1.0);

    if(vDist > 0.5) discard;
}