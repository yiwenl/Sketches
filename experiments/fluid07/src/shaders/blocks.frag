// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vExtra;
uniform sampler2D textureDepth;
uniform vec2 uMapSize;
varying vec4 vShadowCoord;

#define LIGHT vec3(0.2, 1.0, 1.0)

#pragma glslify: diffuse    = require(glsl-utils/diffuse.glsl)



float rand(vec4 seed4) {
	float dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));
	return fract(sin(dot_product) * 43758.5453);
}

#define NUM_ITER 1


float PCFShadow(sampler2D depths, vec2 size, vec4 shadowCoord) {
	float result = 0.0;
	float bias = 0.001;
	vec2 uv = shadowCoord.xy;

	float total = 1.0;
	for(int x=-NUM_ITER; x<=NUM_ITER; x++){
		for(int y=-NUM_ITER; y<=NUM_ITER; y++){
			vec2 off = vec2(x,y) + rand(vec4(gl_FragCoord.xy, float(x), float(y)));
			off /= size;

			float d = texture2D(depths, uv + off).r;
			if(d < shadowCoord.z - bias) {
				result += 1.0;
			}

			total += 1.0;

		}
	}

	float d = texture2D(depths, uv).r;
	if(d < shadowCoord.z - bias) {
		result += 1.0;
	}

	return 1.0 -result/total;

}


void main(void) {
	float d = diffuse(vNormal, LIGHT, .5);
	vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s = mix(s, 1.0, .25);

	// vec3 color = pow(vColor, vec3(0.5)) * mix(1.0, 1.5, vExtra.y);
	vec3 color = vColor;
	gl_FragColor = vec4(color * d * s, 1.0);
	// gl_FragColor = vec4(vColor * d * s, 1.0);
}