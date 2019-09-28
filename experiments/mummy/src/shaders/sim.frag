// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D textureDepth;
uniform mat4 uDepthMatrix;
uniform float time;
uniform float maxRadius;
uniform vec3 uNose;
uniform vec3 uPreNose;

#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)
#pragma glslify: snoise    = require(./fragments/snoise.glsl)


#define RANGE 10.0

void main(void) {
	vec3 pos          = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel          = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra        = texture2D(textureExtra, vTextureCoord).rgb;
	
	// float noise    = snoise(pos * 3.0 + extra * 0.5 + sin(time * 5.0 * cos(time * 3.0)));
	float noise       = snoise(pos * 0.2 + extra * 0.05 + time * 0.15);
	float posOffset   = mix(0.01, 0.25, noise * .5 + .5);
	vec3 acc          = curlNoise(pos * posOffset - time * .15);
	acc.y             = acc.y * .5 + 1.0;
	acc.z             *= 0.5;
	float speedOffset = mix(extra.g, 1.0, .5);
	
	float dist        = length(pos.xz);

	float radius = 1.0;
	if(dist > radius) {
		float f          = pow(2.0, (dist - radius) * 2.0) * 0.05;
		acc              -= normalize(pos * vec3(1.0, 0.0, 1.0)) * f * 0.75;
	}


	// force by nose movement

	if(distance(uNose, uPreNose) > 0.05) {
		radius   = 2.0;
		dist     = distance(pos.xy, uNose.xy);
		float f  = smoothstep(radius, 0.0, dist);
		vec3 dir = normalize(uNose - uPreNose);
		acc      += f * dir * 3.0 * mix(0.4, 1.0, extra.g);	
	}
	

	
	vel                  += acc * .003 * speedOffset;


	vec4 posScreen       = uDepthMatrix * vec4(pos, 1.0);
	vec2 uvScreen        = posScreen.xy / posScreen.w;
	vec4 colorMap        = texture2D(textureDepth, uvScreen);
	float z              = colorMap.z;
	if(colorMap.a > 0.0) {
		if(pos.z < z) {
			pos.z                += (z - pos.z) * mix(0.3, 0.2, extra.g);		
		}
		
	} else {
		pos.z                += (z - pos.z) * 0.01;
	}

	
	// if(dist < radius) {
	// 	vel *= 0.01;
	// }
	
	
	const float decrease = .96;
	vel                  *= decrease;
	
	pos                  += vel;


	if(pos.y > RANGE) {
		pos.y -= RANGE * 2.0;
		pos.xz *= 0.75;
	}

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(texture2D(textureDepth, uvScreen).xyz, 1.0);
}