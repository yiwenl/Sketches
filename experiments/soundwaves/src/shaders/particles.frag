// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
uniform mat3 uNormalMatrix;
varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec4 vShadowCoord;
varying vec3 vPosition;
uniform sampler2D textureDepth;
uniform sampler2D texture;
uniform sampler2D textureParticle;
uniform float uTheta;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;

#define LIGHT_POS vec3(0.0, 8.0, -2.0)
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

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


#define PI 3.14159265

float orenNayarDiffuse(
	vec3 lightDirection,
	vec3 viewDirection,
	vec3 surfaceNormal,
	float roughness,
	float albedo) {

	float LdotV = dot(lightDirection, viewDirection);
	float NdotL = dot(lightDirection, surfaceNormal);
	float NdotV = dot(surfaceNormal, viewDirection);

	float s = LdotV - NdotL * NdotV;
	float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));

	float sigma2 = roughness * roughness;
	float A = 1.0 + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));
	float B = 0.45 * sigma2 / (sigma2 + 0.09);

	return albedo * max(0.0, NdotL) * (A + B * s / t) / PI;
}


void main(void) {
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
	vec4 colorMap = texture2D(textureParticle, uv);
	if(colorMap.r <= 0.0) {
		discard;
	}

	vec3 N = colorMap.rgb * 2.0 - 1.0;
	N = uNormalMatrix * N;
	float d = diffuse(N, uLightPos);
	d = mix(d, 1.0, .1);
	d *= mix(vNormal.b, 1.0, .5);

	// vec3 lightDirection = normalize(-uLightPos - vPosition);
	// vec3 viewDirection = normalize(uCameraPos - vPosition);
	// float d = orenNayarDiffuse(lightDirection, viewDirection, N, 0., 1.0);

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	float s = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s = mix(s, 1.0, .25);

	vec4 color = vec4(vec3(d * s), 1.0);

    gl_FragColor = color;
}