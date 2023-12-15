#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uCharMap;

out vec4 oColor;

float blendColorDodge(float base, float blend) {
	return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
	return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
	return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
}

void main(void) {
    vec4 color = texture(uMap, vTextureCoord);
    vec4 colorChar = texture(uCharMap, vTextureCoord);
    // color.rgb = blendColorDodge(color.rgb, colorChar.rgb, colorChar.a);

    vec3 colorBlend = color.rgb * colorChar.rgb;
    color.rgb = mix(color.rgb, colorBlend, colorChar.a);

    oColor = color;
}