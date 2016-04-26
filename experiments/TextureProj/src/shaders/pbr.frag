// pbr.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform sampler2D texture;
uniform vec3 uLight;
varying vec4 vShadowCoord;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
    vec4 color = vec4(1.0);

    vec4 shadowCoord	= vShadowCoord / vShadowCoord.w;

    const float shadowBias     = .00005;
    vec4 colorShadow = texture2DProj(texture, shadowCoord, shadowBias);
    color.rgb *= colorShadow.rgb;

    // float d = diffuse(vNormal, uLight);
    // color.rgb *= d;

    gl_FragColor = color;
}