// post.frag

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float invert;


const vec3 COLOR0 = vec3(5.0, 5.0, 15.0)/ 255.0;
const vec3 COLOR1 = vec3(255.0, 252.0, 248.0)/ 255.0;
#define LENG length(vec3(1.0))


vec3 gradientMap(vec3 color) {
	float l = length(color) / LENG;

	return mix(COLOR0, COLOR1, l);
}


float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}

vec3 contrast(vec3 mValue, float mScale, float mMidPoint) {
	return vec3( contrast(mValue.r, mScale, mMidPoint), contrast(mValue.g, mScale, mMidPoint), contrast(mValue.b, mScale, mMidPoint) );
}

vec3 contrast(vec3 mValue, float mScale) {
	return contrast(mValue, mScale, .5);
}


void main(void) {
	vec3 color = texture2D(texture, vTextureCoord).rgb;


	if(invert > .5) {
		color = 1.0 - color;
	}

	color = gradientMap(color);
	gl_FragColor = vec4(color, 1.0);
}
