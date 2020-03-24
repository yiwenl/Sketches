// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D textureDepth;
uniform sampler2D textureData;


uniform float time;
uniform float maxRadius;
uniform mat4 uShadowMatrix;

#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)
#pragma glslify: snoise    = require(./fragments/snoise.glsl)
#pragma glslify: rotate    = require(glsl-utils/rotate.glsl)

#define THRESHOLD 8.0
#define SPWAN_RANGE 5.0
#define PI 3.141592653

void main(void) {
	vec3 pos             = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel             = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra           = texture2D(textureExtra, vTextureCoord).rgb;
	vec3 data            = texture2D(textureData, vTextureCoord).rgb;


	vec4 screenPos = uShadowMatrix * vec4(pos, 1.0);
	vec2 uvScreen = screenPos.xy / screenPos.w;
	vec4 colorDepth = texture2D(textureDepth, uvScreen);

	// float noise 		 = snoise(pos * 3.0 + extra * 0.5 + sin(time * 5.0 * cos(time * 3.0)));
	float noiseSeed 		 = snoise(pos * 0.2 + extra * 0.5 + time * 0.05);
	float posOffset      = mix(0.15, 0.3, noiseSeed * .5 + .5);
	vec3 noise           = curlNoise(pos * posOffset - time * .15);
	vec3 acc             = noise * 0.5;
	acc.y = acc.y * 0.5 + 0.85;

	float radius = SPWAN_RANGE;
	float d, f;
	vec3 dir;

	d = length(pos.xz);
	f = smoothstep(radius * 0.5, radius, d);
	dir = normalize(pos * vec3(1.0, 0.0, 1.0));
	acc -= dir * f * 2.0;

	float target = 0.0;
	if(colorDepth.a > 0.5) {
		// float easing = mix(0.14, 0.1, extra.z);
		float easing = 0.1;
		pos.z += (colorDepth.z - pos.z) * easing;
		target = 1.0;
	} else {
		acc.z -= 0.1;
	}

	data.x += (target - data.x) * 0.1;

	// rotate force
	dir.xz = rotate(dir.xz, -PI * 0.5);
	d = abs(d - 2.0);
	f = smoothstep(2.0, 0.0, d);
	acc += dir * 1.0 * f;

	float speedOffset    = mix(extra.g, 1.0, .5);
	vel                  += acc * .004 * speedOffset;
	
	const float decrease = .96;
	vel                  *= decrease;

	
	pos                  += vel;

	if(pos.y > THRESHOLD) {
		pos.y = -8.0;
		pos.xz = normalize(noise.xz) * noiseSeed * SPWAN_RANGE * 0.6;
		vel *= 0.0;
	}

	data.x = clamp(data.x, 0.0, 1.0);

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(data, 1.0);
	// gl_FragData[3] = vec4(uvScreen, 0.0, 1.0);
}