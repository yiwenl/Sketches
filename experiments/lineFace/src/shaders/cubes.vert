// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix0;
uniform mat4 uShadowMatrix1;

uniform sampler2D texture0;
uniform sampler2D texture1;

uniform float uTime;
uniform float uRange;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vOffset;
const float bias = -0.001;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


float getVisibility(mat4 shadowMatrix, sampler2D texture, vec3 position) {
	vec4 vShadowCoord = shadowMatrix * vec4(position, 1.0);
	vec4 shadowCoord  = vShadowCoord / vShadowCoord.w;
	vec2 uv           = shadowCoord.xy;
	float d           = texture2D(texture, uv).r;

	float visibility = 1.0;
	if(d < shadowCoord.z - bias) {
		visibility = 0.0;
	}

	return visibility;
}

void main(void) {

	float ty = uTime + uRange * mix(aExtra.r, 1.0, .1);
	ty = mod(ty, uRange * 2.0) - uRange;

	vec3 center = aPosOffset;
	center.y += ty;

	float theta = aExtra.y + uTime * mix(aExtra.z, 1.0, .1);
	center.xz = rotate(center.xz, theta);


	float v0 = getVisibility(uShadowMatrix0, texture0, center);
	float v1 = getVisibility(uShadowMatrix1, texture1, center);
	float visibility = (1.0 - v0) * (1.0 - v1);

	vOffset = mix(1.0, aExtra.y * aExtra.z, .2);
	float offset = .1 + (sin(aExtra.y * uTime * 5.0 + aExtra.z) * .5 + .5) * 0.2;
	visibility = mix(visibility, 1.0, offset);

	float scale = visibility;

	vec3 rPos = aVertexPosition;
	rPos.xz = rotate(rPos.xz, theta);

	vec3 position = rPos * scale + center;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vec3 N = aNormal;
    N.xz = rotate(N.xz, theta);
    vNormal = N;
}