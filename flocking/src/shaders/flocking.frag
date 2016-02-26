// sim.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D textureSpeed;
uniform float time;

const float NUM = {{NUM_PARTICLES}};
const float PI = 3.1415926;
const float PI_2 = 3.1415926*2.0;

float map(float value, float sx, float sy, float tx, float ty) {
	float p = (value - sx) / (sy - sx);
	p = clamp(p, 0.0, 1.0);
	return tx + (ty - tx) * p;
}

void main(void) {
	vec3 pos        = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel        = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra      = texture2D(textureExtra, vTextureCoord).rgb;
	vec3 speeds      = texture2D(textureSpeed, vTextureCoord).rgb;

	vec2 uvParticles;
	vec3 posParticle, velParticle;
	float percent;
	vec3 dirToParticle;
	float f, delta, forceApply;

	float RANGE = .65 * mix(extra.x, 1.0, .5);
	float forceOffset = mix(extra.y, 1.0, .5);
	const float minThreshold    = 0.4;
	const float maxThreshold    = 0.7;

	const float speedScale      = 0.15;
	const float repelStrength   = 0.04 * speedScale;
	const float attractStrength = 0.0002 * speedScale;
	const float orientStrength  = 0.02 * speedScale;

	for(float y=0.0; y<NUM; y++) {
		for(float x=0.0; x<NUM; x++) {
			if(x <= y) continue;

			uvParticles = vec2(x, y)/NUM;
			posParticle = texture2D(texturePos, uvParticles).rgb;
			percent = distance(pos, posParticle) / RANGE;
			forceApply = 1.0 - step(1.0, percent);
			forceApply *= forceOffset;
			dirToParticle = normalize(posParticle - pos);

			if(percent < minThreshold) {
				f = (minThreshold/percent - 1.0) * repelStrength;
				vel -= f * dirToParticle * forceApply;
			} else if(percent < maxThreshold) {
				velParticle = texture2D(textureVel, uvParticles).rgb;
				delta = map(percent, minThreshold, maxThreshold, 0.0, 1.0);
				vec3 avgDir = (vel + velParticle) * .5;
				if(length(avgDir) > 0.0) {
					avgDir = normalize(avgDir);
					f = ( 1.0 - cos( delta * PI_2 ) * 0.5 + 0.5 );
					vel += avgDir * f * orientStrength * forceApply;
				}
			} else {
				delta = map(percent, maxThreshold, 1.0, 0.0, 1.0);
				f = ( 1.0 - cos( delta * PI_2 ) * -0.5 + 0.5 );
				vel += dirToParticle * f * attractStrength * forceApply;
			}

		}

	}

	const float maxRadius = 3.0;
	const float minRadius = 1.25;
	float dist = length(pos);
	if(dist > maxRadius) {
		float f = (dist - maxRadius) * .005;
		vel -= normalize(pos) * f * forceOffset;
	}

	if(dist < minRadius) {
		float f = (1.0-dist/minRadius) * 1.0;
		vel += normalize(pos) * f * forceOffset;
	}

	vec3 velDir = normalize(vel);
	float speed = length(vel);
	if(speed < speeds.x) {		//	min speed
		vel = velDir * speeds.x;
	} 

	if(speed > speeds.y) {		//	max speed;
		vel = velDir * speeds.y;
	}


	gl_FragColor = vec4(vel, 1.0);
}