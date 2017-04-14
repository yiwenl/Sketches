// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uRatio;

varying vec2 vTextureCoord;
varying vec3 vNormal;

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
	vec3 position = aVertexPosition;
	// position.x /= uRatio;
	position.y *= uRatio;
	position.xy *= 1.5;
    gl_Position = vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}