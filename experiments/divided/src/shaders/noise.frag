#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform vec3 uSeeds;

out vec4 oColor;

#pragma glslify: fbm    = require(./glsl-utils/fbm/3d.glsl)

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
void main(void) {
    float n0 = fbm(vec3(vTextureCoord * 250.0, uSeeds.x));
    float n1 = fbm(vec3(vTextureCoord * 280.0, uSeeds.y));
    float n2 = fbm(vec3(vTextureCoord * 220.0, uSeeds.z));
    float n = mix(n0, n1, n2);
    n = smoothstep(0.1, 0.9, n);

    float n3 = noise(vTextureCoord * 500.0 + uSeeds.xy) - 0.5;
    n += n3 * 0.3;
    
    oColor = vec4(vec3(n), 1.0);
}