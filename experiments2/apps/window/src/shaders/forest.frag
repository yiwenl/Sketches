#version 300 es

precision highp float;
in vec3 vColor;
in float vDepth;
in float vViewZ;
in vec3 vWorldPos;
in vec4 vShadowCoord;

uniform float uFogStart;
uniform float uFogEnd;
uniform float uZCutoff;
uniform sampler2D uDepthMap;
uniform vec3 uLight;

out vec4 oColor;

float pcfShadow(vec4 sc, sampler2D uDepthMap) {
    const int s = 2;
    float shadow = 0.0;
    
    float bias = 0.005;
    float threshold = sc.z - bias;
    
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(-s, -s)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(-s, 0)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(-s, s)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(0, -s)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(0, 0)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(0, s)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(s, -s)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(s, 0)).r);
    shadow += step(threshold, textureProjOffset(uDepthMap, sc, ivec2(s, s)).r);
    return shadow / 9.0;
}

void main(void) {
    if(distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;
    
    // Cut out points too close to camera (z > -uZCutoff in view space)
    if(vWorldPos.z > uZCutoff) {
        discard;
    }
    
    // Linear fog calculation
    float fogFactor = clamp((uFogEnd - vDepth) / (uFogEnd - uFogStart), 0.0, 1.0);
    
    // Shadow calculation
    vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
    float shadow = pcfShadow(shadowCoord, uDepthMap);
    shadow = mix(0.2, 1.0, shadow);
    
    // Apply shadow to color
    vec3 finalColor = vColor * shadow;
    
    oColor = vec4(finalColor, fogFactor);
}