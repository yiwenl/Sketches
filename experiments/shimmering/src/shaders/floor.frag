// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;

#define uMapSize vec2(1024.0)
#define FOG_DENSITY 0.2

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


void main(void) {
	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	float s = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s = mix(s, 1.0, .25);

	float noiseFloor = rand(vec4(gl_FragCoord.xyyx * 5.0));
	float a = distance(vTextureCoord, vec2(.5)) + noiseFloor * 0.01;
	a = smoothstep(.5, .1, a);

	vec4 color = vec4(vec3(s), 1.0);

	float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount = fogFactorExp2(fogDistance - 4.5, FOG_DENSITY);
	const vec4 fogColor = vec4(0.0, 0.0, 0.0, 1.0); // white

	gl_FragColor = mix(color, fogColor, fogAmount);
	gl_FragColor *= a;
}