// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform vec3 uLightPos;
uniform float uShadowPrec;
uniform float uShadowSpread;

#define uMapSize vec2(2048.0)
#define NUM 3


float rand(vec4 seed4) {
	float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
	return fract(sin(dot_product) * 43758.5453);
}



float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

float PCFShadow(sampler2D depths, vec2 size, vec4 shadowCoord) {
	float result = 0.0;
	float bias = 0.000005;
	vec2 uv = shadowCoord.xy;

	float _d = texture2D(depths, uv).r;
	float spread = 1.0/ (abs(shadowCoord.z - _d) * uShadowSpread + 1.0);
	vec2 _size = size * spread; 
	float count = 0.0;

	for(int x=-NUM; x<=NUM; x++){
		for(int y=-NUM; y<=NUM; y++){
			// vec2 off = vec2(x,y) + rand(vec4(gl_FragCoord.xy, float(x), float(y)));
			vec2 off = vec2(x,y);
			off /= _size;

			float d = texture2D(depths, uv + off).r;
			if(d < shadowCoord.z - bias) {
				result += 1.0;
			}
			count += 1.0;
		}
	}
	return 1.0 -result/count;

}

void main(void) {
	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	vec2 uv = shadowCoord.xy;
	float s = PCFShadow(textureDepth, uMapSize * uShadowPrec, shadowCoord);
	s = mix(s, 1.0, .25);

	float d = diffuse(vNormal, uLightPos);
	d = mix(d, 1.0, .5) * s;

	d = smoothstep(0.0, 0.75, d) + 0.25;

    gl_FragColor = vec4(vec3(d), 1.0);
}