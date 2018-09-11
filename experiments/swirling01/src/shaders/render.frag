precision highp float;

varying vec4 vColor;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform sampler2D textureParticle;

#define uMapSize vec2(1024.0)
#define FOG_DENSITY 0.2
#define LIGHT_POS vec3(0.0, 10.0, 0.0)


float rand(vec4 seed4) {
	float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
	return fract(sin(dot_product) * 43758.5453);
}


float PCFShadow(sampler2D depths, vec2 size, vec4 shadowCoord) {
	float result = 0.0;
	float bias = 0.005;
	vec2 uv = shadowCoord.xy;

	for(int x=-1; x<=1; x++){
		for(int y=-1; y<=1; y++){
			vec2 off = vec2(x,y) + rand(vec4(gl_FragCoord.xy, float(x), float(y)));
			off /= size;

			float d = texture2D(depths, uv + off).r;
			if(d < shadowCoord.z - bias) {
				result += 1.0;
			}

		}
	}
	return 1.0 -result/9.0;

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
	// if(distance(gl_PointCoord, vec2(.5)) > .5) discard;
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
	vec4 colorMap = texture2D(textureParticle, uv);
	if(colorMap.r <= 0.0) {
		discard;
	}
	vec3 N = colorMap.rgb * 2.0 - 1.0;

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	float s = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s = mix(s, 1.0, .25);

	float d = diffuse(N, LIGHT_POS);
	vec3 finalColor = mix(vec3(d), vColor.rgb, .5);

	vec4 color = vec4(finalColor, 1.0);
	color.rgb *= s;

	float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount = fogFactorExp2(fogDistance - 4.5, FOG_DENSITY);
	const vec4 fogColor = vec4(0.0, 0.0, 0.0, 1.0); // white

	// gl_FragColor = mix(color, fogColor, fogAmount);
	gl_FragColor = color;
}