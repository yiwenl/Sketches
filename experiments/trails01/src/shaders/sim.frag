// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D texturePosOrg;
uniform sampler2D textureData;
uniform float time;
uniform float maxRadius;

#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)
#pragma glslify: snoise    = require(./fragments/snoise.glsl)
#pragma glslify: rotate    = require(glsl-utils/rotate.glsl)

#define PI 3.141592653

void main(void) {
	vec3 pos             = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel             = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra           = texture2D(textureExtra, vTextureCoord).rgb;
	vec3 posOrg          = texture2D(texturePosOrg, vTextureCoord).rgb;
	vec3 data            = texture2D(textureData, vTextureCoord).rgb;
	float life = data.z;

	// float noise 		 = snoise(pos * 3.0 + extra * 0.5 + sin(time * 5.0 * cos(time * 3.0)));
	float noise 		 		= snoise(pos * 0.2 + extra * 0.05 + time * 0.15);
	float posOffset      = mix(0.1, 0.25, noise * .5 + .5);
	vec3 acc             = curlNoise(pos * posOffset - time * .15);
	acc.z = (acc.z + 0.5) * 0.5;
	float speedOffset    = mix(extra.g, 1.0, .5);

	vec2 dir = normalize(pos.xy);
	dir = rotate(dir, PI * .55); 
	acc.xy += dir;
	
	
	vel                  += acc * .002 * speedOffset;
	
	const float decrease = .96;
	vel                  *= decrease;
	
	pos                  += vel;

	life += mix(0.01, 0.015, extra.b) * 0.5;
	if(life > 1.0) {
		life = 0.0;
		pos = posOrg;
		vel *= 0.1;
	}

	data.z = life;

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(posOrg, 1.0);
	gl_FragData[4] = vec4(data, 1.0);
}