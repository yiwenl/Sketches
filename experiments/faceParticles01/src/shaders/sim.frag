// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D textureMask;

uniform float time;
uniform float uRadius;
uniform float uRange;
uniform float uAttractForce;

#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)
#pragma glslify: snoise    = require(./fragments/snoise.glsl)



void main(void) {
	vec3 pos             = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel             = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra           = texture2D(textureExtra, vTextureCoord).rgb;


	vec4 screenPos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vec2 screenUV = screenPos.xy / screenPos.w * .5 + .5;
	vec4 colorMask = texture2D(textureMask, screenUV);
	vec3 posMask = colorMask.xyz;

	float noise 		 		 = snoise(pos * 0.2 + extra * 0.15 + time * 0.15);
	float posOffset      = mix(0.01, 0.25, noise * .5 + .5);
	vec3 acc             = curlNoise(pos * posOffset - time * .15);
	acc.y *= 0.5;
	float speedOffset    = mix(extra.g, 1.0, .5);
	acc.y += 1.0;


	float d = length(pos.xz);
	vec2 dir = normalize(pos.xz);
	acc.xz -= dir * 0.08 * d;

	if(colorMask.a <= 0.0) {
		acc.z -= 0.25;
	}
	
	vel                  += acc * .003 * speedOffset;
	
	const float decrease = .96;
	vel                  *= decrease;
	
	pos                  += vel;
	if(colorMask.a > 0.0) {
		float easing = mix(0.05, 0.15, extra.z);
		pos.z += (posMask.z - pos.z) * easing * uAttractForce;
	}

	if(pos.y > uRange) {
		pos.y -= uRange * 2.0;
		vel *= 0.95;
	}

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
}