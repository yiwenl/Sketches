// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D textureOrg;
uniform float time;
uniform float maxRadius;
uniform float uPullingForce;
uniform float uSpeed;
uniform float uLifeScale;
uniform float uIsLine;
uniform float uGeneralSpeed;
uniform float uSpwan;
uniform float uSpeedOffset;
uniform float uBurstForce;

#define tmp vec3(1.0, 0.0, -1.0)
#define PI 3.141592653

#pragma glslify: rotate = require(./fragments/rotate.glsl)
#pragma glslify: curlNoise = require(./fragments/curlnoise.glsl)
#pragma glslify: snoise = require(./fragments/snoise.glsl)
#pragma glslify: easing = require(./fragments/easings/cubic-out.glsl)


vec3 getPolarCoord(vec3 pos) {
	float a = atan(pos.y, pos.x);
	float l = length(pos.xy);
	return vec3(a, l, pos.z);
}

void main(void) {
	vec3 pos           = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel           = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra         = texture2D(textureExtra, vTextureCoord).rgb;
	vec3 posOrg        = texture2D(textureOrg, vTextureCoord).rgb;
	float posOffset    = mix(extra.b, 1.0, .95) * .5;
	
	float life         = extra.x;
	float distToCenter = length(pos);
	
	//	get polar coordinate
	float numWaves     = 6.0 + sin(cos(time * 2.32443589) * 0.7435987) * 2.0;
	vec3 posPolar      = getPolarCoord(pos);
	posPolar.x         = sin(posPolar.x * numWaves + posPolar.y * 4.0) * 2.0;
	posPolar.y         *= 2.0;
	posPolar.z         *= 0.1;
	
	
	//	noise force
	float f            = smoothstep(7.0, 5.0, distToCenter);
	vec3 acc           = curlNoise(posPolar * posOffset + time * 1.1) * 0.074 * f * vec3(vec2(1.0), 0.5);
	float speedOffset  = mix(extra.b, 1.0, .95);
	
	//	rotate force
	vec3 dir           = normalize(pos) * vec3(1.0, 1.0, 0.0);
	dir.xy             = rotate(dir.xy, PI * 0.5);
	f                  = smoothstep(5.0, 0.5, distToCenter);
	acc                += dir * f * 0.5;
	
	
	//	pull force
	float pullForce    = uPullingForce;
	dir                = -normalize(pos);
	float zOffset      = smoothstep(6.0, 3.0, distToCenter);
	dir.z              -= pullForce * easing(zOffset);
	f                  = smoothstep(8.0, 0.5, distToCenter) + 0.1;
	acc                += dir * f * 0.15;
	
	
	//	push/burst force
	float r            = 3.5 + snoise(vec3(time * 3.0)) * 0.5;
	float t            = time;
	vec3 burstCenter   = vec3(cos(t) * r, sin(t) * r, -1.0);
	
	float dist         = distance(burstCenter, pos);
	float repelRadius  = 2.0;
	f                  = smoothstep(repelRadius, repelRadius * 0.5, dist);
	dir                = normalize(pos - burstCenter);
	float pushForce    = clamp(0.0, 1.0, snoise(vec3(burstCenter.xy * 0.1, time * 4.0)));
	pushForce          = pow(pushForce, 2.0);
	float offsetSpeed = smoothstep(2.0, 1.0, uSpeedOffset);
	acc                += dir * f * pushForce * uBurstForce * offsetSpeed;



	//	life
	float lifeOffset = smoothstep(1.0, 0.5, life);

	const float generalSpeed = 0.005;
	vel                  += acc * speedOffset * ( 1.0 + lifeOffset) * generalSpeed * (1.0 + zOffset * 0.5) * uSpeed * uGeneralSpeed;
	
	const float decrease = .96;
	vel                  *= decrease;
	
	pos                  += vel;
	life -= 0.008 * mix(extra.y, 1.0, .5) * uLifeScale;
	if(life < 0.0) {

		if(uSpwan > 0.5) {
			life = 1.0;
			pos = posOrg;
			vel *= normalize(posOrg) * 0.1;	
		} else {
			life = 0.0;
		}
	}

	extra.x = life;

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(posOrg, 1.0);
}