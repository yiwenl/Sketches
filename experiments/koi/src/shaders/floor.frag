// copy.frag

#define SHADER_NAME FLOOR_FRAG

precision highp float;
varying vec2 vTextureCoord;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;

#define uMapSize vec2(1024.0)
#define COLOR_SHADOW vec3(79.0, 87.0, 96.0)/255.0

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

float hardShadow(sampler2D depths, vec2 size, vec4 shadowCoord) {
	float result = 0.0;
	float bias = 0.005;
	vec2 uv = shadowCoord.xy;

	float d = texture2D(depths, uv).r;
	if(d < shadowCoord.z - bias) {
		result = 1.0;
	}

	return result;
}


float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

void main(void) {

	float d = distance(vTextureCoord, vec2(.5));
	d = smoothstep(0.5, 0.0, d);

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	// float s          = 1.0 - PCFShadow(textureDepth, uMapSize, shadowCoord);
	float s          = hardShadow(textureDepth, uMapSize, shadowCoord);

	vec4 color 		 = vec4(vec3(d), 1.0);

	
	gl_FragColor     = vec4(COLOR_SHADOW, 1.0) * s;

	gl_FragColor = mix(color, gl_FragColor, .8);
}