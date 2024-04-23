#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vColor;
in vec4 vShadowCoord;

uniform sampler2D uDepthMap;
uniform sampler2D uMap;

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

void main(void) {
    if(distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;
    vec4 color = texture(uMap, gl_PointCoord); 
    if(color.a < 0.01) discard;

    color.rgb *= vColor;

    // shadow
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = samplePCF3x3(shadowCoord);
    s = mix(.15, 1.0, s);
    color.rgb *= s;


    oColor = color;
}