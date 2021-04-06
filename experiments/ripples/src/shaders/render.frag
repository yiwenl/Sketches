#version 300 es

precision highp float;

in vec3 vColor;
in vec4 vShadowCoord;

uniform sampler2D uDepthMap;
uniform sampler2D uParticleMap;
uniform vec2 uMapSize;

out vec4 oColor;

#define uMapSize vec2(2048.0)

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
    return shadow/9.0;;
}

void main(void) {
    if(distance(gl_PointCoord, vec2(.5)) > .5) discard;

    vec2 uv = gl_PointCoord;
    uv.y = 1.0 - uv.y;
    vec4 color = texture(uParticleMap, uv);
    

    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = samplePCF3x3(shadowCoord);
    s = mix(s, 1.0, 0.1);

    oColor = vec4(vColor * color.rgb * s, 1.0);
    oColor.rgb *= 1.25;
    oColor.rgb = pow(oColor.rgb, vec3(1.5));
}