// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform float time;
uniform float maxRadius;

#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)
#pragma glslify: snoise    = require(./fragments/snoise.glsl)

void main(void) {
	vec3 pos             = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel             = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra           = texture2D(textureExtra, vTextureCoord).rgb;

	float noise 		 = snoise(pos * 3.0 + extra * 0.5 + sin(time * 5.0 * cos(time * 3.0)));
	// float noise 		 = snoise(pos * 0.2 + time * 0.15);
	float posOffset      = mix(0.1, 0.15, noise * .5 + .5);
	vec3 acc             = curlNoise(pos * posOffset - time * .15);
	float speedOffset    = mix(.5, 1.0, extra.g);
	
	float dist           = length(pos);
	if(dist > maxRadius) {
		float f          = pow(2.0, (dist - maxRadius) * 2.0) * 0.05;
		acc              -= normalize(pos) * f * 0.25;
	}
	
	vel                  += acc * .002 * speedOffset;
	
	const float decrease = .96;
	vel                  *= decrease;
	
	pos                  += vel;

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
}