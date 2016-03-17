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

	gl_FragColor = vec4(vel, 1.0);
}