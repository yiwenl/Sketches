#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec4 vShadowCoord;

uniform sampler2D uMap;
uniform sampler2D uDepthMap;
uniform vec3 uColor;
uniform vec3 uColorShadow;

out vec4 oColor;

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
    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
    float s             = samplePCF3x3(shadowCoord);
    if(shadowCoord.x < 0.0 ||shadowCoord.x > 1.0 ||
    shadowCoord.y < 0.0 ||shadowCoord.y > 1.0) {
        s = 1.0;
    }

    if(shadowCoord.z > 1.0) {
        s = 1.0;
    }

    float d = distance(vTextureCoord, vec2(.5));
    d = smoothstep(0.4, 0.0, d);

    vec3 color = mix(uColorShadow, uColor, s);
    color += d * 0.1;
    // color *= mix(uColorShadow, vec3(1.0), s);

    oColor = vec4(color, 1.0);
}