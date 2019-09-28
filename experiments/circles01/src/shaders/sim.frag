#extension GL_EXT_draw_buffers : require 

#define NUM ${NUM}

precision highp float;
varying vec2 vTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureExtra;
uniform sampler2D textureMap;

uniform float uOpeningOffset;

#define xy vec3(1.0, 1.0, 0.0)
#define easing 0.1

#pragma glslify: getRadius = require(./getRadius.glsl)
#pragma glslify: ease      = require(glsl-easings/exponential-in-out.glsl)

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float getMapColor(vec2 pos) {
	vec4 screenPos = uProjectionMatrix * uViewMatrix * vec4(pos, 0.0, 1.0);
	vec2 uv = screenPos.rg / screenPos.w * .5 + .5;

    // float l = luma(texture2D(textureMap, uv).rgb * 1.25);
    // l = clamp(l, 0.0, 1.0);
	return texture2D(textureMap, uv).r;
}

float getScale(float particleIndex) {
    float scale = uOpeningOffset - particleIndex;
    scale = clamp(scale, 0.0, 1.0);

    return ease(scale);
}



void main(void) {
    vec3 pos = texture2D(texturePos, vTextureCoord).rgb;
    vec2 vel = texture2D(textureVel, vTextureCoord).rg;
    vec3 extra = texture2D(textureExtra, vTextureCoord).rgb;
    vec2 acc = vec2(0.0);

    float num = float(NUM);
    float colorMap = getMapColor(pos.rg);
    float scale = getScale(extra.x);
    float radius = getRadius(colorMap) * scale;


    vec3 posParticle, extraParticle;
    vec2 uvParticles, dir;
    float radiusParticle, dist, colorMapParticle;

    for(int i=0; i<NUM; i++) {
    	for(int j=0; j<NUM; j++) {
    		vec2 uvParticles = vec2(float(i) / num, float(j) / num);
    		posParticle = texture2D(texturePos, uvParticles).rgb;
    		dist = distance(pos.rg, posParticle.rg); 

    		if(dist > 0.0) {
                extraParticle = texture2D(textureExtra, uvParticles).rgb;
    			colorMapParticle = getMapColor(posParticle.rg);
    			radiusParticle = getRadius(colorMapParticle) * getScale(extraParticle.x);

    			if(dist < (radius + radiusParticle) * 0.5) {
    				dir = normalize(pos.rg - posParticle.rg);
    				acc += dir;
                    // pos.rg += dir * 0.001;
    			}

    		}

    	}

    }

    dir = normalize(pos.rg);
    acc -= dir * 0.05;
    vel += acc * 0.001;
    float maxSpeed = 0.01;
    if(length(vel) > maxSpeed) {
    	vel = normalize(vel) * maxSpeed;
    }
    pos.rg += vel;
    pos.b += (colorMap * scale - pos.b) * easing;
    vel *= 0.9;
    // pos.b = scale

    gl_FragData[0] = vec4(pos, 1.0);
    gl_FragData[1] = vec4(vel, 0.0, 1.0);
    gl_FragData[2] = vec4(extra, 1.0);
}