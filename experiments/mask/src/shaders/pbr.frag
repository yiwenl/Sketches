// pbr.frag

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

const int NUM_DROPS = {NUM_DROPS};

uniform sampler2D   uAoMap;
uniform sampler2D   uDropMap;
uniform sampler2D   uGoldMap;
uniform samplerCube uRadianceMap;
uniform samplerCube uIrradianceMap;

uniform vec3        uBaseColor;
uniform float       uRoughness;
uniform float       uRoughness4;
uniform float       uMetallic;
uniform float       uSpecular;
uniform float       uNormalScale;

uniform float       uExposure;
uniform float       uGamma;
uniform float 		numPaints;

varying vec3        vNormal;
varying vec3        vPosition;
varying vec3        vEyePosition;
varying vec3        vWsNormal;
varying vec3        vWsPosition;
varying vec2        vTextureCoord;
varying vec4        vDropCoords[NUM_DROPS];

#define saturate(x) clamp(x, 0.0, 1.0)
#define PI 3.1415926535897932384626433832795


// Filmic tonemapping from
// http://filmicgames.com/archives/75

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

// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV )
{
	const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
	vec4 r = Roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
	return SpecularColor * AB.x + AB.y;
}


// http://the-witness.net/news/2012/02/seamless-cube-map-filtering/
vec3 fix_cube_lookup( vec3 v, float cube_size, float lod ) {
	float M = max(max(abs(v.x), abs(v.y)), abs(v.z));
	float scale = 1.0 - exp2(lod) / cube_size;
	if (abs(v.x) != M) v.x *= scale;
	if (abs(v.y) != M) v.y *= scale;
	if (abs(v.z) != M) v.z *= scale;
	return v;
}

vec3 correctGamma(vec3 color, float g) {
	return pow(color, vec3(1.0/g));
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 randVec3(vec2 co) {
	return vec3(rand(co), rand(co.yx), rand(co.yx*co));
}

vec3 getPbr(vec3 N, vec3 V, vec3 baseColor, float roughness, float metallic, float specular) {
	vec3 diffuseColor   = baseColor - baseColor * metallic;
	vec3 specularColor  = mix( vec3( 0.08 * specular ), baseColor, specular );  

	vec3 color;
	float roughness4 = pow(roughness, 4.0);
	
	// sample the pre-filtered cubemap at the corresponding mipmap level
	float numMips       = 6.0;
	float mip           = numMips - 1.0 + log2(roughness);
	vec3 lookup         = -reflect( V, N );
	lookup              = fix_cube_lookup( lookup, 512.0, mip );
	vec3 radiance       = pow( textureCubeLodEXT( uRadianceMap, lookup, mip ).rgb, vec3( 2.2 ) );
	vec3 irradiance     = pow( textureCube( uIrradianceMap, N ).rgb, vec3( 1 ) );
	
	// get the approximate reflectance
	float NoV           = saturate( dot( N, V ) );
	vec3 reflectance    = EnvBRDFApprox( specularColor, roughness4, NoV );
	
	// combine the specular IBL and the BRDF
	vec3 diffuse        = diffuseColor * irradiance;
	vec3 _specular      = radiance * reflectance;
	color               = diffuse + _specular;

	return color;
}

void main() {
	const float dropBias     = .00005;
	vec4 colorDrops = vec4(1.0);
	vec4 colorGold = vec4(0.0);
	for(int i=0; i<NUM_DROPS; i++) {
		if(float(i) >= numPaints) break;
		vec4 coord  = vDropCoords[i] / vDropCoords[i].w;
		vec4 drop   = texture2DProj(uDropMap, coord, dropBias);
		vec4 gold   = texture2DProj(uGoldMap, coord, dropBias);
		colorDrops *= drop;
		if(length(colorGold.rgb) <= 0.0) {
			colorGold = gold;
		}
	} 

	float roughness 	= uRoughness;
	float metallic 		= uMetallic;
	float specular 		= uSpecular;
	vec3 baseColor 		= uBaseColor;
	vec3 normalOffset 	= vec3(0.0);

	roughness 			*= colorDrops.r;
	float br 			= length(colorDrops.rgb);
	// float tmp 			= colorDrops.r * colorDrops.a;
	if(br < 1.0) {
		metallic = 0.7;
		specular = 1.0;
		baseColor = vec3(1.000, 0.816, 0.636);
		normalOffset 	= randVec3(vTextureCoord*0.1) * uNormalScale;
	}
	
	vec3 N              = normalize( vWsNormal + normalOffset);
	vec3 V              = normalize( vEyePosition );

	vec3 color          = getPbr(N, V, baseColor, roughness, metallic, specular);

	vec3 ao             = texture2D(uAoMap, vTextureCoord).rgb;
	color               *= ao;

	// apply the tone-mapping
	color               = Uncharted2Tonemap( color * uExposure );
	// white balance
	color               = color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );
	
	// gamma correction
	color               = pow( color, vec3( 1.0 / uGamma ) );

	// output the fragment color
	gl_FragColor        = vec4( color, 1.0 );

}