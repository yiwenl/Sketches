// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec4 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uNums;
uniform float uTime;
uniform float uShrink;
uniform float uLineWidth;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vDebug;


#pragma glslify: curlNoise = require(./fragments/curlnoise.glsl)
#pragma glslify: rotate = require(./fragments/rotate.glsl)
// #pragma glslify: ease = require(./fragments/easings/exponential-out.glsl)
#pragma glslify: ease = require(./fragments/easings/exponential-out.glsl)
#pragma glslify: easeIn = require(./fragments/easings/exponential-in.glsl)
#pragma glslify: ease0 = require(./fragments/easings/sine-out.glsl)

#define ringSize 0.01
#define PI 3.141592653

vec3 getPos(vec3 p, inout float life) {
	float p0        = p.x / uNums.x;
	float p1        = p.y / uNums.y;
	
	float totalTime = mix(aExtra.z, 1.0, 0.5) * 4.0;
	float percent   = mix(aExtra.z, 1.0, .5);	
	float time      = mod(uTime, totalTime);
	
	p1              = (p1 * percent + time) / (totalTime + percent);
	p1              = mod(p1 + aExtra.w, 1.0);
	float scale     = 1.0 - abs(p1 - 0.5) / 0.5;
	
	scale           = smoothstep(0.0, 0.4, scale);
	life            = scale;
	


	//	line size
	float t = 1.0 - abs(aTextureCoord.y - 0.5) / 0.5;
	float r = ringSize * ease(t) * mix(aExtra.w, 1.0, .5) * scale * uLineWidth;


	float a = p0 * PI * 2.0;
	vec3 v = vec3(cos(a) * r, 0.0, sin(a) * r);

	float tmp = 2.0;

	float radius = p.z + aExtra.w;

	if(uShrink > 0.5) {
		r = radius - ease0(p1) * tmp;	
	} else {
		r = radius - p1 * tmp;
	}

	float totalAngle = aExtra.y;

	float theta = PI * totalAngle ;

	tmp = 0.5;
	// a = ((p1 * tmp + uTime) / (8.0 + tmp)) * theta;
	a = p1 * theta + aExtra.x;

	float zOffset = 2.5;
	v.x += r;
	if(uShrink > 0.5) {
		v.z += zOffset - easeIn(p1) * 2.0;	
	} else {
		v.z += zOffset - p1 * 2.0;
	}
	
	v.xy = rotate(v.xy, a);

	return v;
}

void main(void) {
	float life = 0.0;
	vec3 pos      = getPos(aVertexPosition, life);
	pos.xy        += (aExtra.zw - 0.5) * 0.85;
	
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	// vDebug     = uShrink > 0.5 ? vec3(1.0, 0.0, 0.0) : vec3(1.0);
	vDebug        = vec3(life );
}