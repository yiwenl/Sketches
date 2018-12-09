// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec2 vOffset;

uniform sampler2D texture;
uniform sampler2D textureMap;
uniform float uUVScale;

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}

vec2 contrast(vec2 v, float mScale) {
	return vec2(
			contrast(v.x, mScale),
			contrast(v.y, mScale)
		);
}

#define PI 3.141592653

void main(void) {
	vec2 uv = vTextureCoord;
    vec4 color = texture2D(texture, uv);
    if(color.a < 0.7) discard;

    uv = contrast(vUV, uUVScale);
    vec4 colorMap = texture2D(textureMap, uv);

    color.rgb = blendOverlay(color.rgb, colorMap.rgb);
    gl_FragColor = color;
    // gl_FragColor = colorMap;
}