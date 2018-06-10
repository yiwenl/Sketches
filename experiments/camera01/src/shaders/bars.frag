// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vColor;
varying vec3 vNormal;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform sampler2D textureGradient;
uniform vec3 uLight;
uniform vec2 uDimension;


#define uMapSize vec2(1024.0)
#define FOG_DENSITY 0.2

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}



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


float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

void main(void) {
	float d          = diffuse(vNormal, uLight);
	d                = mix(d, 1.0, .5);

	vec3 color 		 = vColor * d;
	vec2 uv 		 = gl_FragCoord.xy / uDimension;
	vec3 gradient 	 = texture2D(textureGradient, uv).rgb;

	color = blendOverlay(color, gradient, .5);
	
	// vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	// float s          = PCFShadow(textureDepth, uMapSize, shadowCoord);
	// s                = mix(s, 1.0, .75);
	
	gl_FragColor     = vec4(color, 1.0);
}