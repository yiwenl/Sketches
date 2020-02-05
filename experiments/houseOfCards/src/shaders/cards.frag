// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;
varying vec4 vShadowCoord;

uniform vec3 uLightPos;
uniform sampler2D textureDepth;

#pragma glslify:diffuse    = require(glsl-utils/diffuse.glsl)

#define uMapSize vec2(1024.0)

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

void main(void) {
    float d             = diffuse(vNormal, uLightPos, .5);
    vec4 shadowCoord    = vShadowCoord / vShadowCoord.w;
	float s             = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s                   = mix(s, 1.0, .5);
    gl_FragColor        = vec4(vec3(d * s), 1.0);
}