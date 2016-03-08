// sim.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D textureSpeed;
uniform float time;
uniform float range;
uniform float speedScale;
uniform float skipCount;
uniform float minThreshold;
uniform float maxThreshold;

const float NUM = {{NUM_PARTICLES}};
const float PI = 3.1415926;
const float PI_2 = 3.1415926*2.0;

float map(float value, float sx, float sy, float tx, float ty) {
	float p = (value - sx) / (sy - sx);
	p = clamp(p, 0.0, 1.0);
	return tx + (ty - tx) * p;
}

void main(void) {
	vec3 pos    = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel    = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra  = texture2D(textureExtra, vTextureCoord).rgb;
	vec3 speeds = texture2D(textureSpeed, vTextureCoord).rgb;

	vec2 uvParticles;
	vec3 posParticle, velParticle, dirToParticle, avgDir;
	float percent, f, delta, forceApply;
	float _range = range * mix(extra.x, 1.0, .5);
	float forceOffset = mix(extra.y, 1.0, .5);

	float repelStrength   = 0.04 * speedScale;
	float attractStrength = 0.0002 * speedScale;
	float orientStrength  = 0.02 * speedScale;

	const float minPercent = 0.001;

	for(float y=0.0; y<NUM; y++) {
		for(float x=0.0; x<NUM; x++) {
			if(x <= y) continue;

			uvParticles = vec2(x, y)/NUM;
			posParticle = texture2D(texturePos, uvParticles).rgb;
			percent = distance(pos, posParticle) / _range;
			if(percent <= minPercent) percent = minPercent;

			forceApply = 1.0 - step(1.0, percent);
			forceApply *= forceOffset;
			dirToParticle = normalize(posParticle - pos);

			if(percent < minThreshold) {
				f = (minThreshold/percent - 1.0) * repelStrength;
				vel -= f * dirToParticle * forceApply;
			} else if(percent < maxThreshold) {
				velParticle = texture2D(textureVel, uvParticles).rgb;
				delta = map(percent, minThreshold, maxThreshold, 0.0, 1.0);
				avgDir = (vel + velParticle) * .5;
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


	vec3 velDir = normalize(vel);
	float speed = length(vel);
	if(speed < speeds.x) {		//	min speed
		vel = velDir * speeds.x;
	} 

	if(speed > speeds.y) {		//	max speed;
		vel = velDir * speeds.y;
	}


	const float maxRadius = 7.0;
	float dist = length(pos);
	if(dist > maxRadius) {
		float f = (dist - maxRadius) * .02;
		vel -= normalize(pos) * f * forceOffset;
	}


	const float minY = .75;
	if(pos.y < minY) {
		float f = (minY - pos.y) * .02;
		vel.y += f;
	}


	gl_FragColor = vec4(vel, 1.0);
}