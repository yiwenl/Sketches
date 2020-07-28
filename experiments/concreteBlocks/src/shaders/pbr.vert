#define SHADER_NAME pbr_vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vExtra;
varying vec4 vShadowCoord;

#pragma glslify: rotate    = require(glsl-utils/rotate.glsl)
#pragma glslify: curlNoise    = require(glsl-utils/curlNoise.glsl)
#pragma glslify: snoise    = require(glsl-utils/snoise.glsl)

void main(void) {
	float isFront = step(0.0, aVertexPosition.z);
	vec3 pos = aVertexPosition;
	float r = 0.2;

	float base = snoise(aExtra + uTime * 0.1) * .5 + .5;
	float posOffset = mix(0.5, 1.0, base);

	// float d = length(aPosOffset.xy);
	// vec3 _p = vec3(aPosOffset.xy * 0.01, d * 2.5);

	vec3 noise = curlNoise(aPosOffset * posOffset - vec3(0.0, 0.0, uTime * 0.2)) * .5 + 0.5;
	float rx = mix(-r, r, noise.x) * isFront;
	float ry = mix(-r, r, noise.y) * isFront;

	if(isFront > 0.5) {
		float t = pos.z;
		pos.z -= t;
		pos.yz = rotate(pos.yz, rx);
		pos.xz = rotate(pos.xz, ry);
		pos.z += t;
	}

	pos.z += mix(0.0, mix(0.5, 1.0, noise.z), isFront) * 0.2;


	vec4 position = uModelMatrix * vec4(pos, 1.0);
	position.xyz += aPosOffset;
	vPosition     = position.xyz / position.w;

	vec3 n = aNormal;
	n.yz = rotate(n.yz, rx);
	n.xz = rotate(n.xz, ry);
	
	vNormal       = normalize(vec3(uModelMatrix * vec4(n, 0.0)));
	vTextureCoord = aTextureCoord + (aExtra.xy - 0.5);
	
	gl_Position   = uProjectionMatrix * uViewMatrix * position;

	vExtra = aExtra;

	vShadowCoord = uShadowMatrix * position;
}
