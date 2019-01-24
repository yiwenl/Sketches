precision highp float;

varying vec4 vColor;
varying vec4 vShadowCoord;
varying vec3 vPosition;
uniform sampler2D textureDepth;
uniform sampler2D textureParticle;
uniform mat3 uNormalMatrix;

#define uMapSize vec2(1024.0)
#define FOG_DENSITY 0.2
#define LIGHT_POS vec3(0.0, 10.0, 0.0)
#define SHADOW_QUALITY 2
#define LIGHT_RANGE 5

float rand(vec4 seed4) {
	float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
	return fract(sin(dot_product) * 43758.5453);
}


float PCFShadow(sampler2D depths, vec2 size, vec4 shadowCoord) {
	float result = 0.0;
	float bias = 0.005;
	vec2 uv = shadowCoord.xy;
	float base = 0.0;

	for(int x=-SHADOW_QUALITY; x<=SHADOW_QUALITY; x++){
		for(int y=-SHADOW_QUALITY; y<=SHADOW_QUALITY; y++){
			vec2 off = vec2(x,y) + rand(vec4(gl_FragCoord.xy, float(x), float(y)));
			off /= size;

			float d = texture2D(depths, uv + off).r;
			if(d < shadowCoord.z - bias) {
				result += 1.0;
			}

			base += 1.0;
		}
	}


	return 1.0 -result/base;

}

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	if(distance(gl_PointCoord, vec2(.5)) > .475) discard;
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
	vec4 colorMap = texture2D(textureParticle, uv);
	if(colorMap.r <= 0.0) {
		discard;
	}
	vec3 N = colorMap.rgb * 2.0 - 1.0;

	// vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	// float s = PCFShadow(textureDepth, uMapSize, shadowCoord);
	// s = mix(s, 1.0, .25);
	// if(vPosition.y > 0.0) {
	// 	s = 1.0;
	// }


	float d = 0.0;
	float base = 0.0;

	for(int i = -LIGHT_RANGE; i<=LIGHT_RANGE; i++) {
		vec3 light = -vPosition;
		light.x = float(i) * 0.5;
		d += diffuse(N, light);	
		base += 1.0;
	}

	d /= base;
	vec4 color = vec4(vec3(d), 1.0);

	gl_FragColor = color;
	// gl_FragColor.rgb = N;
}