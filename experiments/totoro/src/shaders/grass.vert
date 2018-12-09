// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec2 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uSize;
uniform vec3 uHit;

uniform sampler2D textureNoise;

varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vNormal;
varying vec2 vOffset;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


#define touchRadius 1.0

void main(void) {
	vec3 pos      = aVertexPosition;
	pos.xz        = rotate(pos.xz, aExtra.y);
	pos.y         *= (1.0 + aPosOffset.y * .2) * 1.6;
	pos.xz        += aPosOffset.xz;
	
	vUV           = aPosOffset.xz / uSize * .5 + .5;
	vUV.y         = 1.0 - vUV.y;
	
	vec3 noise    = texture2D(textureNoise, vUV).xyz;
	pos.xz        += noise.xy * aTextureCoord.y * 0.5;
	
	float d       = distance(aPosOffset.xz, uHit.xz);
	d             = smoothstep(touchRadius, 0.0, d);
	vec2 dir      = normalize(aPosOffset.xz - uHit.xz);
	pos.xz        += dir * 0.25 * aTextureCoord.y;
	
	vOffset       = noise.xy * aTextureCoord.y;
	
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord * vec2(.5, 1.0) + vec2(aExtra.x, 0.0);
	vNormal       = aNormal;
	
}