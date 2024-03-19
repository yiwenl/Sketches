const curlNoise = require("./curlnoise.glsl");
module.exports = `
// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

uniform vec2 uCenter;
uniform vec2 uDir;
uniform float uTime;
uniform float uRadius;
uniform float uStrength;
uniform float uNoiseStrength;
uniform float uIsVelocity;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

${curlNoise}

#define PI 3.141592653

void main(void) {
	vec2 center  = uCenter;

	float r = 0.15 + sin(cos(uTime) * 4.489538925) * 0.0;
	vec2 v       = vec2(r, 0.0);
	v            = rotate(v, uTime);
	
	vec3 noise = curlNoise(vec3(vTextureCoord * 2.0, uTime)) * uNoiseStrength;

	vec2 dir = uDir;
	dir *= uStrength;
	float d      = distance(vTextureCoord, center);
	d            = smoothstep(uRadius, 0.0, d);
	
	
	vec3 color   = uIsVelocity > 0.5 ? vec3(dir, 0.0) : vec3(uStrength);
	if(uIsVelocity > .5) {
		color += noise * 0.5;
	} else {
		color += noise.rrr * uStrength;
	}
	color        *= d;
	
	vec3 base    = texture2D(texture, vTextureCoord).xyz;
	
	gl_FragColor = vec4(color + base, 1.0);
}
`;
