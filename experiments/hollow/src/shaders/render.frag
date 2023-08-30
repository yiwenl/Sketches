#version 300 es
precision highp float;

uniform sampler2D uDepthMap;
uniform sampler2D uShadowMap;
uniform float uPlaneSize;

in vec3 vColor;
in vec3 vPosition;
in vec4 vShadowCoord;
in float vSkip;

out vec4 oColor;


float samplePCF3x3( vec4 sc )
{
    const int s = 2;
    float shadow = 0.0;
    float bias = 0.005;
    float threshold = sc.z - bias;

    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2(-s,-s) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2(-s, 0) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2(-s, s) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2( 0,-s) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2( 0, 0) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2( 0, s) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2( s,-s) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2( s, 0) ).r);
    shadow += step(threshold, textureProjOffset( uShadowMap, sc, ivec2( s, s) ).r);
    return shadow/9.0;
}



void main(void) {
    if(vSkip > .5) discard;
    if(distance(gl_PointCoord, vec2(.5)) > .5) discard;


    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	// float s             = samplePCF3x3(shadowCoord);

    vec2 uv = shadowCoord.xy;
    float depth = texture(uShadowMap, uv).r;
    float g = depth > shadowCoord.z ? 1.0 : 0.0;

    oColor = vec4(vec3(depth), 1.0);

    // s = mix(s, 1.0, 0.25);
    
    // oColor = vec4(vColor * s, 1.0);
    // oColor = vec4(vec3(s), 1.0);
    // oColor = vec4(shadowCoord.xy * .5 + .5, 0.0, 1.0);


    // vec2 uv = vPosition.xy / uPlaneSize * .5 + .5;
    // oColor = vec4(uv, 0.0, 1.0);
    // oColor = texture(uShadowMap, uv);
}