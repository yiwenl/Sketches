#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vColor;
in vec4 vShadowCoord;

uniform sampler2D uDepthMap;
uniform vec3 uLight;
uniform vec3 uColor;
uniform vec3 uColorShadow;

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
    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = samplePCF3x3(shadowCoord);
    // s = mix(s, 1.0, .3);

    vec3 n = vNormal;
    if(!gl_FrontFacing) {
        n = -n;
    }

    float d = diffuse(uLight, n);
    d = smoothstep(0.0, 0.5, d);
    d = mix(d, 1.0, .65);

    // vec3 color = uColor * vColor * d;
    vec3 color = mix(uColorShadow, uColor, s);
    // color *= mix(uColorShadow, vec3(1.0), s);
    color *= d * vColor;

    oColor = vec4(color, 1.0);
}