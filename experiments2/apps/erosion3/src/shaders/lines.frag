#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vColor;
in float vIndex;
in vec4 vShadowCoord;
in float vSkip;

uniform vec3 uCameraPosition;
uniform float uLinesThreshold;
uniform vec3 uLight;
uniform sampler2D uDepthMap;


out vec4 oColor;

#define BASE_COLOR vec3(1.0)

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

    if(vSkip > 0.5) {
        discard;
    }
    // hide lines that are not facing the camera
    float d = dot(normalize(uCameraPosition), vColor);
    d = step(uLinesThreshold-0.001, d);

    if(d <= 0.0) {
        discard;
    }

    float shadowStrength = 0.4;

    // directional diffuse
    vec3 n = normalize(vColor);
    vec3 l = normalize(uLight);
    float ndotl = dot(n, l);
    float diffuse = max(0.0, ndotl);
    // diffuse = mix(shadowStrength, 1.0, diffuse);

    // shadow
    vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
    float shadow = pcfShadow(shadowCoord, uDepthMap);
    shadow = mix(shadowStrength, 1.0, shadow);

    float numLevels = 8.0;
    float index = mod(vIndex, numLevels) / numLevels + 0.5/numLevels;
    float shade = shadow * diffuse;
    shade = pow(shade, 1.5);
    shade = smoothstep(0.0, 0.75, shade);
    if(index > shade) {
        discard;
    }

    // oColor = vec4(BASE_COLOR * diffuse * shadow, 1.0);
    // oColor = vec4(vec3(shadow), 1.0);
    // oColor = vec4(vec3(shade), 1.0);
    // oColor = vec4(vec3(diffuse), 1.0);
    // oColor = vec4(vec3(index), 1.0);
    oColor = vec4(vec3(1.0), 1.0);
}