// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform vec2 uMapSize;

#define EPSILON 0.00001
#define NUM 2

float rand(vec4 seed4) {
	float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
	return fract(sin(dot_product) * 43758.5453);
}

float offset_lookup(sampler2D map, vec4 loc, vec2 offset, vec2 texmapscale) {
	return texture2DProj(map, vec4(loc.xy + offset * texmapscale * loc.w, loc.z, loc.w)).r;
}

void main(void) {
	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	float xOffset = 1.0/uMapSize.x;
	float yOffset = 1.0/uMapSize.y;


	float factor = 0.0;

	for (int y = -NUM ; y <= NUM-1 ; y++) {
		for (int x = -NUM ; x <= NUM-1 ; x++) {
			vec2 offset = vec2( float(x) + 0.5, float(y) + 0.5);
			float i = float(x) + float(y);
			float noise = rand(vec4(gl_FragCoord.xyy, i));

			factor += offset_lookup(textureDepth, shadowCoord, offset, 1.0/uMapSize);
		}
	}

	float dividor = pow(float(NUM), 2.0);
	factor /= dividor;

	factor = mix(factor, 1.0, .25);
	// factor *= 0.25;

	float noiseFloor = rand(vec4(gl_FragCoord.xyyx * 5.0));
	float a = distance(vTextureCoord, vec2(.5)) + noiseFloor * 0.01;
	a = smoothstep(.5, .1, a);

	gl_FragColor = vec4(vec3(factor), a);
}