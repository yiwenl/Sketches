#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec4 vShadowCoord;
uniform sampler2D uDepthMap;
uniform vec3 uLight;
uniform vec3 uColor;

out vec4 oColor;


float samplePCF3x3( vec4 sc )
{
    const int s = 4;
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

#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)

void main(void) {
    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = samplePCF3x3(shadowCoord);
    s = mix(.1, 1.0, s);


    float g = diffuse(vNormal, uLight, .5);

    float dx = abs(vTextureCoord.x - 0.5);
    float dy = abs(vTextureCoord.y - 0.5);
    float _min = 0.4;
    float _max = 0.5;
    dx = smoothstep(_max, _min, dx);
    dy = smoothstep(_max, _min, dy);

    float d = pow(dx * dy, 5.0);
    g *= mix(0.85, 1.0, d);

    oColor = vec4(uColor * g * s, 1.0);
}