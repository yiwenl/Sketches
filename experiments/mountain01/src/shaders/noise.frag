// copy.frag

#extension GL_EXT_draw_buffers : require 
#define NUM_OCTAVES ${NUM_OCTAVES}
precision highp float;


varying vec2 vTextureCoord;

uniform float uSeed;
uniform float uNoiseScale;
uniform float uNormalScale;


float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}


float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
	mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}


float textureOffset(vec2 uv) {
	float dist = distance((uv - uSeed), vec2(.5));
	float offset = smoothstep(0.75, 0.0, dist);

	float noise = fbm(uv) * offset + pow(offset, 12.0) * 0.05;
	// noise = mix(0.0, offset * 0.05 + noise, pow(offset, 2.0));
	return noise;
}

float textureOffset(vec2 uv, vec2 off) {
	float noise = textureOffset(uv + off);
	return noise;
}



void main(void) {
	vec2 size = vec2(uNormalScale, 0.0);


	vec3 off = vec3(-1.0, 0.0, 1.0);	
	float t = 0.1;
	off *= t;

	vec2 tex_coord = vTextureCoord + uSeed;

	float s11 = textureOffset(tex_coord);
	float s01 = textureOffset(tex_coord, off.xy);	//	left
	float s21 = textureOffset(tex_coord, off.zy);	//	right


	float s10 = textureOffset(tex_coord, off.yx);	//	top
	float s12 = textureOffset(tex_coord, off.yz);	//	bottom

	vec3 vx = normalize(vec3(size.x, s21 - s01, 0.0));
	vec3 vy = normalize(vec3(0.0, s12 - s10, size.x));

	vec3 n = normalize(cross(vy, vx));


	gl_FragData[0] = vec4(vec3(s11), 1.0);
	gl_FragData[1] = vec4(n, 1.0);
}