precision highp float;

varying vec4 vColor;
varying vec4 vShadowCoord;
varying vec3 vWsPosition;
varying vec3 vExtra;
varying vec4 vScreenPosition;

uniform sampler2D textureDepth;
uniform sampler2D textureParticle;
uniform float uContrast;
uniform float uOpacity;
uniform vec3 uLight;
uniform float time;

uniform sampler2D textureBg1;
uniform sampler2D textureBg2;
uniform float uOffsetFadeOut;

#define uMapSize vec2(1024.0)
#define FOG_DENSITY 0.2
#define LIGHT_POS vec3(0.0, 10.0, 0.0)


#pragma glslify: snoise = require(./fragments/snoise.glsl)

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


vec3 getPolarCoord(vec3 pos) {
	float a = atan(pos.y, pos.x);
	float l = length(pos.xy);
	return vec3(a, l, pos.z);
}

void main(void) {
	// if(distance(gl_PointCoord, vec2(.5)) > .5) discard;
	vec2 uv            = gl_PointCoord;
	uv.y               = 1.0 - uv.y;
	vec4 colorMap      = texture2D(textureParticle, uv);
	if(colorMap.r      <= 0.0) {
		discard;
	}
	vec3 N             = colorMap.rgb * 2.0 - 1.0;
	
	vec4 shadowCoord   = vShadowCoord / vShadowCoord.w;
	float s            = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s                  = mix(s, 1.0, .1);
	
	vec3 light         = mix(normalize(uLight), normalize(LIGHT_POS), .5);
	
	float d            = diffuse(N, light);
	d                  = mix(d, 1.0, .2);
	
	
	float distToCenter = length(vWsPosition.xy);
	
	float numWaves     = 6.0 + sin(cos(time * 2.32443589) * 0.7435987) * 2.0;
	vec3 posPolar      = getPolarCoord(vWsPosition);
	posPolar.x         = sin(posPolar.x * numWaves + posPolar.y) * 2.0;
	float noiseSeed    = snoise(vec3(posPolar + time * 0.15));
	float noise        = snoise(vec3(vWsPosition.xy * 0.5, noiseSeed));
	
	vec2 uvScreen      = vScreenPosition.xy / vScreenPosition.w * .5 + .5;	
	// float start     = 2.25 + (vExtra.b - 0.5) * 1.2;
	float start        = mix(1.0, 3.0, vExtra.b);
	// float leng      = (1.0 + (vExtra.r - 0.5) * 1.5) * 3.0;
	float leng         = mix(2.5, 4.0, vExtra.r);
	float p            = smoothstep(start, start + leng + noise * 0.1, distToCenter);
	uvScreen.x         = abs(uvScreen.x - 0.5) + 0.5;
	uvScreen           += (vExtra.gb - 0.5) * 0.4;
	vec4 color1        = texture2D(textureBg1, uvScreen);
	vec4 color2        = texture2D(textureBg2, uvScreen);
	
	vec4 color         = vec4(vec3(d), 1.0);
	color              *= mix(color2, color1, p);
	color.rgb          *= s * vColor.rgb * uContrast;
	color.rgb          *= mix(vExtra.g, 1.5, .5);
	
	
	float opacity      = smoothstep(6.0+uOffsetFadeOut, 3.0+uOffsetFadeOut, distToCenter);
	// float opacity0  = smoothstep(0.75, 2.0, distToCenter);
	float zThreshold   = -3.25;
	float opacityZ     = smoothstep(zThreshold-0.5, zThreshold, vWsPosition.z);
	
	float opacityOpen  = smoothstep(0.0, 0.5, uOpacity);
	color              *= opacity * opacityZ * opacityOpen;
	
	gl_FragColor       = color;
	// gl_FragColor       = vec4(vec3(noise), 1.0);
}