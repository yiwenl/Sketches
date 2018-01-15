precision highp float;

varying vec4 vColor;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform sampler2D textureParticle;
uniform samplerCube textureEnv;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform float		uExposure;
uniform float		uGamma;

#define uMapSize vec2(1024.0)
#define FOG_DENSITY 0.2
#define LIGHT_POS vec3(0.0, 10.0, 0.0)




const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;

vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
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

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}



void main(void) {
	// if(distance(gl_PointCoord, vec2(.5)) > .5) discard;
	vec2 uv = gl_PointCoord;
	uv.y = 1.0 - uv.y;
	vec4 colorMap = texture2D(textureParticle, uv);
	if(colorMap.r <= 0.01) {
		discard;
	}
	vec3 N = uModelViewMatrixInverse * (colorMap.rgb * 2.0 - 1.0);

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	float s = PCFShadow(textureDepth, uMapSize, shadowCoord);
	s = mix(s, 1.0, .5);

	// float d = diffuse(N, LIGHT_POS);
	// d = mix(d, 1.0, .5);

	vec3 irr = textureCube( textureEnv, N ).rgb;
	irr				= Uncharted2Tonemap( irr * uExposure );
	irr				= irr * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );
	irr				= pow( irr, vec3( 1.0 / uGamma ) );

	vec4 color = vec4(irr, 1.0);
	// vec4 color = vec4(vec3(d), 1.0);
	color.rgb *= s * vColor.rgb;

	float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount = fogFactorExp2(fogDistance - 7.5, FOG_DENSITY);
	const vec4 fogColor = vec4(0.0, 0.0, 0.0, 1.0); // white

	gl_FragColor = mix(color, fogColor, 0.0);
}