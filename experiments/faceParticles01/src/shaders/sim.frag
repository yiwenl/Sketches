// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform float time;
uniform float uRadius;
uniform float uRange;

#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)
#pragma glslify: snoise    = require(./fragments/snoise.glsl)



void main(void) {
	vec3 pos             = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel             = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra           = texture2D(textureExtra, vTextureCoord).rgb;

	// float noise 		 = snoise(pos * 3.0 + extra * 0.5 + sin(time * 5.0 * cos(time * 3.0)));
	float noise 		 = snoise(pos * 0.2 + extra * 0.05 + time * 0.15);
	float posOffset      = mix(0.01, 0.25, noise * .5 + .5);
	vec3 acc             = curlNoise(pos * posOffset - time * .15);
	acc.y *= 0.5;
	float speedOffset    = mix(extra.g, 1.0, .5);
	acc.y += 1.0;


	float d = length(pos.xz);
	vec2 dir = normalize(pos.xz);
	acc.xz -= dir * 0.1 * d;
	
	vel                  += acc * .003 * speedOffset;
	
	const float decrease = .96;
	vel                  *= decrease;
	
	pos                  += vel;

	if(pos.y > uRange) {
		pos.y -= uRange * 2.0;
		vel *= 0.95;
	}

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
}