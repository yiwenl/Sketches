// copy.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uTime;


#define NUM_OCTAVES 5

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


const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);
float fbm2( in vec2 p ){
    float f = 0.0;
    f += 0.5000*noise( p ); p = m2*p*2.02;
    f += 0.2500*noise( p ); p = m2*p*2.03;
    f += 0.1250*noise( p ); p = m2*p*2.01;
    f += 0.0625*noise( p );

    return f/0.9375;
}


float getHeight(vec2 uv) {
	return fbm(uv * 1.5 + uTime);
}

float textureOffset(vec2 uvOffset) {
	return getHeight(vTextureCoord + uvOffset);
}

void main(void) {
	const float scale = 0.01;
	vec2 size = vec2(2.0, 0.0) * scale * 1.5;
	vec3 off = vec3(-1.0, 0.0, 1.0) * scale;
	float noise = getHeight(vTextureCoord);

	float s11 = noise;
	float s01 = textureOffset(off.xy);
	float s21 = textureOffset(off.zy);
	float s10 = textureOffset(off.yx);
	float s12 = textureOffset(off.yz);

	vec3 va = normalize(vec3(size.xy,s21-s01));
    vec3 vb = normalize(vec3(size.yx,s12-s10));


    gl_FragData[0] = vec4(vec3(noise), 1.0);
	gl_FragData[1] = vec4(cross(va,vb).xzy, 1.0);
}