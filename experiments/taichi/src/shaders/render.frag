precision highp float;

varying vec2 vUV;
varying vec3 vColor;
varying vec3 vExtra;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform sampler2D textureParticle;
uniform sampler2D textureBg;
uniform sampler2D textureColor;
uniform vec3 uPosLight;

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
	if(distance(gl_PointCoord, vec2(.5)) > .5) discard;
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
	vec4 normalMap = texture2D(textureParticle, uv);
	if(normalMap.a <= 0.01) {
		discard;
	}
	vec3 N = normalMap.rgb * 2.0 - 1.0;

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	float s = PCFShadow(textureDepth, uMapSize, shadowCoord);
	float t = texture2D(textureBg, vColor.xy).r;
	float d = diffuse(N, uPosLight);

	if(t < 0.5) {
		// d = smoothstep(0.8, 0.2, d);
		d += 0.1;
		d *= 6.0;
	} 
	s = mix(s, 1.0, .25);
	

	vec4 color = vec4(vec3(d), 1.0);
	

	// vec3 colorMap = texture2D(textureColor, vUV).rgb;
	// if(t < 0.5) {
	// 	color.rgb = mix(color.rgb, vec3(1.0), .2);
	// } else {
	// 	d = mix(d, 1.0, .25);
	// 	color.rgb = colorMap* s * d * 3.0;
	// }

	vec3 colorMap = texture2D(textureColor, vUV).rgb;
	if(t < 0.5) {
		// color.rgb = mix(color.rgb, vec3(1.0), .2);
		color.rgb *= colorMap;

		float n = vColor.z;
		n = smoothstep(1.0, 0.0, n);
		n = mix(n, 1.0, .5);
		color.rgb *= n;

	} else {
		// d = mix(d, 1.0, .25);
		
	}

	color.rgb *= s;

	color.rgb *= mix(vExtra.b, 1.0, .5);
	

	gl_FragColor = color;
	// gl_FragColor = vec4(vColor, 1.0);
	// gl_FragColor = vec4(vec3(t), 1.0);
}