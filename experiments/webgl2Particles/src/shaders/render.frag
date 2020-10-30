#version 300 es

precision highp float;
in vec3 vColor;
in vec4 vShadowCoord;

uniform sampler2D textureDepth;
uniform sampler2D textureParticle;

uniform float uUseTextureOffset;

out vec4 oColor;

#define uMapSize vec2(2048.0)
#define FOG_DENSITY 0.2
#define LIGHT_POS vec3(0.0, 10.0, 0.0)

float samplePCF4x4( vec4 sc )
{
    const int r = 2;
    const int s = 2 * r;
    
    float shadow = 0.0;
    float bias = 0.001;
    float threshold = sc.z - bias;
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-s,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-r,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( r,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( s,-s) ).r);
    
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-s,-r) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-r,-r) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( r,-r) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( s,-r) ).r);
    
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-s, r) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-r, r) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( r, r) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( s, r) ).r);
    
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-s, s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2(-r, s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( r, s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth,  sc, ivec2( s, s) ).r);
        
    return shadow/16.0;
}


float samplePCF3x3( vec4 sc )
{
    const int s = 2;
    float shadow = 0.0;
    float bias = 0.005;
    float threshold = sc.z - bias;

    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2(-s,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2(-s, 0) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2(-s, s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2( 0,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2( 0, 0) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2( 0, s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2( s,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2( s, 0) ).r);
    shadow += step(threshold, textureProjOffset( textureDepth, sc, ivec2( s, s) ).r);
    return shadow/9.0;;
}


void main(void) {
    if(distance(gl_PointCoord, vec2(.5)) > .5) {
        discard;
    }

    vec2 uv = gl_PointCoord;
    uv.y = 1.0 - uv.y;
    vec4 colorMap = texture(textureParticle, uv);
    if(colorMap.a <= 0.01) {
        discard;
    }
    colorMap.rgb *= 1.5;
    
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	// float s             = samplePCF4x4(shadowCoord);
	float s             = samplePCF3x3(shadowCoord);
    // float sOld          = PCFShadow(textureDepth, uMapSize, shadowCoord);
    // s = mix(sOld, s, uUseTextureOffset);

    s = mix(s, 1.0, .25);
    oColor = vec4(vColor * s * colorMap.rgb, 1.0);

}