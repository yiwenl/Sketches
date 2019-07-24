// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE
#define uMapSize vec2(1024.0)
#define FOG_DENSITY 0.2

precision highp float;
varying vec2 vTextureCoord;
varying float vHeight;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform sampler2D textureParticle;
uniform vec3 uColors[5];
uniform vec3 uLightPos;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


vec3 getColor(float index) {
	if(index < 0.5) {
		return uColors[0];
	} else if(index < 1.5) {
		return uColors[1];
	} else if(index < 2.5) {
		return uColors[2];
	} else if(index < 3.5) {
		return uColors[3];
	} else {
		return uColors[4];
	}
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


float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

void main(void) {
	vec4 N = texture2D(textureParticle, gl_PointCoord);
	if(N.a <= 0.01) {
		discard;
	}

	vec3 normal      = normalize(N.xyz * 2.0 - 1.0);
	float d          = diffuse(normal, uLightPos);
	d                = mix(d, 1.0, .5);
	vec3 color       = getColor(vHeight * 5.0);
	
	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	float s          = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s                = mix(s, 1.0, .5);
	color            = color * d * s;
	gl_FragColor     = vec4(color, 1.0);
}