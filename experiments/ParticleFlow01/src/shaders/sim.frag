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
uniform float uSkipCount;
uniform vec3 uHit;
uniform vec3 uHits[NUM];
uniform vec3 uPreHits[NUM];

#pragma glslify: snoise = require(./fragments/snoise.glsl)
#pragma glslify: curlNoise = require(./fragments/curlnoise.glsl)

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

#define PI 3.141592653


vec3 getPolarPos(vec3 v) {
	float x = v.x;
	float y = length(v.yz) * 0.25 + cos(time * 5.0 + v.x) * 0.05;
	vec2 n  = normalize(v.yz);
	float z = atan(n.x, n.y);
	z       = sin(z * 6.0 + sin(time * 3.0) * 2.0);

	return vec3(x, y, z);
}

vec3 toNormalize(vec3 a) {
	float l = length(a);
	if(l > 0.0) {
		return normalize(a);
	} else {
		return vec3(0.0);
	}
}

void main(void) {
	vec3 pos             = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel             = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra           = texture2D(textureExtra, vTextureCoord).rgb;
	vec3 pp = pos * 5.0;
	pp.x -= time * 3.5;
	// pp.y += sin(time) * 1.328945675;
	// pp.z += cos(time * 4.43859476) * 1.82495567;
	float noise 		 = snoise(pp);
	float posOffset      = mix(extra.r, 1.0, .4 + noise * 0.2) * (.25 + sin(time * 3.0) * 0.1);

	vec3 posPolar = getPolarPos(pos);
	vec3 acc             = curlNoise(posPolar * posOffset + vec3(time * 0.5, 0.0, 0.0));
	acc.x = acc.x * .5 + 2.0;
	// acc.x *= 0.5;
	float speedOffset    = mix(extra.g, 1.0, .85);
	float speedOffset2    = mix(extra.b, 1.0, 0.8 + sin(time) * 0.2);


	//	rotation speed
	vec2 dir = normalize( pos.yz );
	dir = rotate(dir, PI * 0.6);
	acc.yz += dir * 1.5 * speedOffset2;

	
	float dist           = length(pos.yz);
	float _maxRadius = maxRadius * 0.5;
	if(dist > _maxRadius) {
		float f          = pow(2.0, (dist - _maxRadius) * 2.0) * 0.04;
		acc.yz           -= normalize(pos.yz) * f;
	}


	//	pulling force
	float range = 4.0;
	for(int i=0; i<NUM; i++) {
		vec3 hit = uHits[i];
		dist = distance(hit, pos);
		
		float f = smoothstep(range, range * 0.5, dist);
		vec3 dirToHit = normalize(hit - pos);
		acc -= dirToHit * f * 2.0;
	}

	range = 6.0;
	for(int i=0; i<NUM; i++) {
		vec3 hit      = uHits[i];
		vec3 preHit   = uPreHits[i];
		dist          = distance(hit, pos);
		
		float f       = smoothstep(range, range * 0.5, dist);
		vec3 dirToHit = toNormalize(hit - preHit);
		acc           += dirToHit * f * 25.0;
	}

	
	
	vel                  += acc * .0015 * speedOffset * uSkipCount;
	
	const float decrease = .97;
	vel                  *= decrease;


	pos                  += vel;
	if(pos.x > uRange) {
		pos.x -= uRange * 2.0;
		vel *= 0.1;
	}

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
}