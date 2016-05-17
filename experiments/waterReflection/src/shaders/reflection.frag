// reflection.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureReflection;
uniform sampler2D textureNormal;
uniform mat3 uNormalMatrix;

void main(void) {
	vec3 mirrorNormal = vec3(0.0, 1.0, 0.0);
	vec3 waveNormal = texture2D(textureNormal, vTextureCoord).rgb * 2.0 - 1.0;

	vec3 flatNormal = waveNormal - dot (waveNormal, mirrorNormal) * mirrorNormal;
	vec3 eyeNormal = uNormalMatrix * flatNormal;
    vec2 reflectOffset = normalize (eyeNormal.xy) * length (flatNormal);
    reflectOffset = (reflectOffset - .5 ) * 0.01;

    vec4 colorReflection = texture2D(textureReflection, vTextureCoord + reflectOffset);

    gl_FragColor = vec4(waveNormal, 1.0);
    gl_FragColor = vec4(flatNormal, 1.0);
    gl_FragColor = vec4(eyeNormal, 1.0);
    gl_FragColor = colorReflection;
}