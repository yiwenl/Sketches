// reflection.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureReflection;
uniform sampler2D textureNormal;
uniform mat3 uNormalMatrix;
uniform float uReflectionStrength;

float diffuse(vec3 N, vec3 L) {
    return max(dot(N, normalize(L)), 0.0);
}

const vec3 LIGHT = vec3(0.0, 1.0, 1.0);


void main(void) {
	vec3 mirrorNormal = vec3(0.0, 1.0, 0.0);
    vec2 uv = vTextureCoord;
    // vec3 waveNormal = texture2D(textureNormal, uv).rgb * 2.0 - 1.0;
	vec3 waveNormal = texture2D(textureNormal, uv).rgb;

	vec3 flatNormal = waveNormal - dot (waveNormal, mirrorNormal) * mirrorNormal;
	vec3 eyeNormal = uNormalMatrix * flatNormal;
    // float d = diffuse(eyeNormal, LIGHT);
    // d = mix(d, 1.0, .9) * .95;
    vec2 reflectOffset = normalize(eyeNormal.xy) * length(flatNormal);
    // reflectOffset = (reflectOffset - .25 ) * 0.01;
    reflectOffset = (reflectOffset - .25 ) * uReflectionStrength;

    vec4 colorReflection = texture2D(textureReflection, vTextureCoord + reflectOffset);
    colorReflection.rgb *= .9;
    gl_FragColor = colorReflection;
}