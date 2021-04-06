#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vColor;
in vec3 vDebug;
in vec4 vShadowCoord;

uniform sampler2D textureShadow;
uniform vec3 uLight;
uniform vec2 uMapSize;
uniform float uIsDepth;


#pragma glslify: diffuse = require(glsl-utils/diffuse.glsl)

out vec4 oColor;

float samplePCF3x3( vec4 sc )
{
    const int s = 2;
    float shadow = 0.0;
    float bias = 0.005;
    float threshold = sc.z - bias;

    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2(-s,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2(-s, 0) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2(-s, s) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2( 0,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2( 0, 0) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2( 0, s) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2( s,-s) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2( s, 0) ).r);
    shadow += step(threshold, textureProjOffset( textureShadow, sc, ivec2( s, s) ).r);
    return shadow/9.0;;
}

void main(void) {
	if(vDebug.x < 0.0) {
		discard;
	}

	float _diffuse = diffuse(vNormal, uLight, .65);

	vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = samplePCF3x3(shadowCoord);
	s                   = mix(s, 1.0, .25);

	oColor = vec4(vColor * _diffuse * s * 1.25, 1.0);

	if(uIsDepth > 0.5) {
		oColor = vec4(gl_FragCoord.zzz, 1.0);
	}
}