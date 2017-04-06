// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uRatio;


float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}

vec2 contrast(vec2 mValue, float mScale, float mMidPoint) {
	return vec2( contrast(mValue.r, mScale, mMidPoint), contrast(mValue.g, mScale, mMidPoint));
}

vec2 contrast(vec2 mValue, float mScale) {
	return contrast(mValue, mScale, .5);
}

void main(void) {
	vec2 uv = vTextureCoord;
	uv.x = contrast(uv.x, uRatio * 0.5);
	// uv.y = contrast(uv.y, 1.0/uRatio);

    gl_FragColor = texture2D(texture, uv);
}