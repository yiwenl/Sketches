// sim.frag

#extension GL_EXT_draw_buffers : require 

#define SHADER_NAME SIMULATION

precision highp float;


const float NUM = ${NUM}.0;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform float time;
uniform float maxRadius;
uniform vec2 uResolution;
uniform vec3 uMouse;
uniform float uPulling;
uniform float uGravity;

const float scale = 1.0;
// const float gravity = 0.05 * scale;

void main(void) {
	vec3 pos        = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel        = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra      = texture2D(textureExtra, vTextureCoord).rgb;


	vel.y += uGravity;

	// vel.y += extra.r * 0.1;
	vec2 uv;
	vec3 posParticle, dir;
	float f, dist;
	const float minDist = 20.0;

	for(float x=0.0; x<NUM; x+=1.0) {
		for(float y=0.0; y<NUM; y+=1.0) {
			uv = vec2(x, y)/NUM;
			posParticle = texture2D(texturePos, uv).rgb;
			dist = distance(pos, posParticle);
			if(dist <= 0.0) {
				continue;
			}
			if(dist < minDist) {
				dir = normalize(pos - posParticle);
				// f = 1.0 / (minDist-dist) * 0.01 * scale;
				f = (minDist - dist) * 0.04 * scale;

				vel += dir * f;
			}
		}
	}

	vec2 center = uResolution * 0.5;
	vec2 dirToCenter = normalize(pos.xy - center);
	vel.xy -= dirToCenter * 0.1 * uPulling;

	//	MOUSE
	const float minRadiusMouse = 150.0;
	dist = distance(pos, uMouse);
	if(dist > 0.0) {
		if(dist < minRadiusMouse) {
			dir = normalize(pos - uMouse);
			f = (minRadiusMouse - dist) * 0.025 * scale;

			vel += dir * f;
		}
	}
	

	
	vel *= 0.96;

	vec3 finalPos = pos + vel;
	const float bounceForce = -0.5;

	if(finalPos.y > uResolution.y) {
		finalPos.y = uResolution.y;
		vel.y *= bounceForce;
	} else if(finalPos.y < 0.0) {
		finalPos.y = 0.0;
		vel.y *= bounceForce;
	}

	if(finalPos.x < 0.0) {
		finalPos.x = 0.0;
		vel.x *= bounceForce;
	} else if(finalPos.x > uResolution.x) {
		finalPos.x = uResolution.x;
		vel.x *= bounceForce;
	}


	const float maxSpeed = 20.0;
	if(length(vel) > maxSpeed) {
		vel = normalize(vel) * maxSpeed;
	}



	gl_FragData[0] = vec4(finalPos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}