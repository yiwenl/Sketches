// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

#define NUM ${NUM}

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform float time;
uniform float maxRadius;
uniform float uRange;
uniform vec3 uHit;
uniform vec3 uHits[NUM];

#pragma glslify: snoise = require(./fragments/snoise.glsl)
#pragma glslify: curlNoise = require(./fragments/curlnoise.glsl)

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

#define PI 3.141592653

void main(void) {
	vec3 pos             = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel             = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra           = texture2D(textureExtra, vTextureCoord).rgb;
	vec3 pp = pos * 5.0;
	pp.x -= time * 3.5;
	float noise 		 = snoise(pp);
	float posOffset      = mix(extra.r, 1.0, .5 + noise * 0.3) * .2;
	vec3 acc             = curlNoise(pos * posOffset + vec3(time * 0.5, 0.0, 0.0));
	acc.x = acc.x * .5 + 2.0;
	// acc.x *= 0.5;
	float speedOffset    = mix(extra.g, 1.0, .85);
	float speedOffset2    = mix(extra.b, 1.0, 0.8 + sin(time) * 0.2);


	//	rotation speed
	vec2 dir = normalize( pos.yz );
	dir = rotate(dir, PI * 0.6 + noise * 0.1);
	acc.yz += dir * (2.0 - posOffset) * 0.6 * speedOffset2;

	
	float dist           = length(pos.yz);
	float _maxRadius = maxRadius * 0.5;
	if(dist > _maxRadius) {
		float f          = pow(2.0, (dist - _maxRadius) * 2.0) * 0.04;
		acc.yz           -= normalize(pos.yz) * f;
	}



	const float range = 6.0;
	for(int i=0; i<NUM; i++) {
		vec3 hit = uHits[i];
		dist = distance(hit, pos);
		

		float f = smoothstep(range, 0.0, dist);
		vec3 dirToHit = normalize(hit - pos);
		acc -= dirToHit * f * 5.0;	
	}

	
	
	vel                  += acc * .002 * speedOffset;
	
	const float decrease = .96;
	vel                  *= decrease;


	pos                  += vel;
	if(pos.x > uRange) {
		pos.x -= uRange * 2.0;
	}

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
}