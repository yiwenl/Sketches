// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float time;

const float num = 8.0;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

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
	
	vec2 t = floor(vTextureCoord * num) * 0.1;
	float noise = rand(t);
	float noise1 = rand(t.yx);
	float noise2 = rand(t.yx * 5.0) * 4.0 + 1.0;
	vec2 uv = fract(vTextureCoord * num);


	const float r = 0.01;
	float x = abs(uv.x - 0.5) / 0.5;
	float y = abs(uv.y - 0.5) / 0.5;


	float c = mod( (noise + time * (1.0+noise1 * 2.0)), 1.0);

	x = smoothstep(c-r, c+r, x);
	y = smoothstep(c-r, c+r, y);

	float g = 1.0 - max(x, y);


    gl_FragColor = vec4(vec3(g), 1.0);
    gl_FragColor = vec4(g);
}