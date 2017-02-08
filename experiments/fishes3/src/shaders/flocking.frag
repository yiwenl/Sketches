// flocking.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;

{{CUSTOM_UNIFORMS}}

uniform float time;
uniform float maxRadius;

const float NUM = {{NUM_PARTICLES}};

void main(void) {
	vec3 pos        = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel        = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra      = texture2D(textureExtra, vTextureCoord).rgb;

	vec2 uvParticles;
	vec3 posParticle, velParticle, dirToParticle;
	float percent, f, delta;


	for(float y=0.0; y<NUM; y++) {
		for(float x=0.0; x<NUM; x++) {
			uvParticles = vec2(x, y)/NUM;
			if(uvParticles == vTextureCoord) continue;

			posParticle = texture2D(texturePos, uvParticles).rgb;
			percent = distance(pos, posParticle) / radius;
			dirToParticle = normalize(posParticle - pos);

			if(percent < lowThreshold) {
				f = (lowThreshold / percent - 1.0) * repelStrength;
				vel -= f * dirToParticle;
			} else if(percent < highThreshold) {

			} else {

			}
		}
	}

    gl_FragData[0] = vec4(pos + vel, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}