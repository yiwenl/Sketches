// pbr.frag

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

const int NUM_DROPS = {NUM_DROPS};

uniform sampler2D 	uAoMap;
uniform sampler2D 	splatter0;
uniform sampler2D 	splatter1;
uniform sampler2D 	splatter2;
uniform sampler2D 	splatter3;
uniform sampler2D 	splatter4;
uniform sampler2D 	textureSplash;
uniform samplerCube uRadianceMap;
uniform samplerCube uIrradianceMap;
uniform vec2 uDropUV[NUM_DROPS];

uniform vec3		uBaseColor;
uniform float		uRoughness;
uniform float		uRoughness4;
uniform float		uMetallic;
uniform float		uSpecular;

uniform float		uExposure;
uniform float		uGamma;

varying vec3        vNormal;
varying vec3        vPosition;
varying vec3		vEyePosition;
varying vec3		vWsNormal;
varying vec3		vWsPosition;
varying vec2 		vTextureCoord;

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



vec4 getColor() {
	vec4 color = vec4(0.0);
	float t = 0.0;
	const float dropBias = .00005;

	for(int i=0; i<NUM_DROPS; i++) {
		vec4 coord    = vDropCoords[i]/vDropCoords[i].w;
		float opacity = uDropUV[i].r;
		float index   = uDropUV[i].g;
		// vec4 colorSplash = texture2DProj(splatter0, coord, dropBias);
		vec4 colorSplash;
		if(index < .5) {
			colorSplash = texture2DProj(splatter0, coord, dropBias);
		} else if(index < 1.5) {
			colorSplash = texture2DProj(splatter1, coord, dropBias);
		} else if(index < 2.5) {
			colorSplash = texture2DProj(splatter2, coord, dropBias);
		} else if(index < 3.5) {
			colorSplash = texture2DProj(splatter3, coord, dropBias);
		} else {
			colorSplash = texture2DProj(splatter4, coord, dropBias);
		}

		color += opacity * colorSplash;
		t += opacity * colorSplash.a;
	}

	t = clamp(t, 0.0, 1.0);

	return vec4(0.0, 0.0, 0.0, t);
}

vec3 getPbr(vec3 N, vec3 V, vec3 baseColor, float roughness, float metallic, float specular) {
	vec3 diffuseColor	= baseColor - baseColor * metallic;
	vec3 specularColor	= mix( vec3( 0.08 * specular ), baseColor, specular );	

	vec3 color;
	float roughness4 = pow(roughness, 4.0);
	
	// sample the pre-filtered cubemap at the corresponding mipmap level
	float numMips		= 6.0;
	float mip			= numMips - 1.0 + log2(roughness);
	vec3 lookup			= -reflect( V, N );
	lookup				= fix_cube_lookup( lookup, 512.0, mip );
	vec3 radiance		= pow( textureCubeLodEXT( uRadianceMap, lookup, mip ).rgb, vec3( 2.2 ) );
	vec3 irradiance		= pow( textureCube( uIrradianceMap, N ).rgb, vec3( 1 ) );
	
	// get the approximate reflectance
	float NoV			= saturate( dot( N, V ) );
	vec3 reflectance	= EnvBRDFApprox( specularColor, roughness4, NoV );
	
	// combine the specular IBL and the BRDF
    vec3 diffuse  		= diffuseColor * irradiance;
    vec3 _specular 		= radiance * reflectance;
	color				= diffuse + _specular;

	return color;
}

const vec4 white = vec4(1.0);

void main() {
	vec3 N 				= normalize( vWsNormal );
	vec3 V 				= normalize( vEyePosition );

	vec4 colorSplash    = getColor();
	// float roughness 	= clamp(colorSplash.a, 0.0, 1.0);
	// float specular      = roughness;
	vec3 color 			= getPbr(N, V, uBaseColor, uRoughness, uMetallic, uSpecular);

	vec3 ao 			= texture2D(uAoMap, vTextureCoord).rgb;
	color 				*= ao;

	// apply the tone-mapping
	color				= Uncharted2Tonemap( color * uExposure );
	// white balance
	color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );
	
	// gamma correction
	color				= pow( color, vec3( 1.0 / uGamma ) );

	// output the fragment color
    gl_FragColor		= mix(white, vec4( color, 1.0 ), colorSplash.a);
    // gl_FragColor		= vec4( color, 1.0 );
    // gl_FragColor		= vec4(colorSplash.rgb, 1.0);

}