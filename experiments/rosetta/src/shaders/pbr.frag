// pbr.frag

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

uniform samplerCube uRadianceMap;
uniform samplerCube uIrradianceMap;
uniform sampler2D 	textureAO;
uniform sampler2D 	texturePaticles;

uniform vec3		uBaseColor;
uniform float		uRoughness;
uniform float		uRoughness4;
uniform float		uMetallic;
uniform float		uSpecular;

uniform float		uExposure;
uniform float		uGamma;
uniform float		particleLightDensity;

varying vec3        vNormal;
varying vec3        vPosition;
varying vec3		vEyePosition;
varying vec3		vWsNormal;
varying vec3		vWsPosition;
varying vec2 		vTextureCoord;

#define saturate(x) clamp(x, 0.0, 1.0)
#define PI 3.1415926535897932384626433832795


const float numParticles = {{NUM_PARTICLES}};
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


vec3 grayscale(vec3 color) {
	float gray = dot(color, vec3(0.299, 0.587, 0.114));
	return vec3(gray);
}


const float fade = .9;
const vec3 COLOR0 = vec3(1.0, 1.0, fade);
const vec3 COLOR1 = vec3(fade, fade, 1.0);
const vec3 LIGHT0 = vec3(1.0, .5, 1.0);
const vec3 LIGHT1 = vec3(-1.0, -.2, 1.0);
const float ambient = .5;


float getDiffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 getDiffuse(vec3 N, vec3 L, vec3 C) {
	return getDiffuse(N, L) * C;
}


float getParticleLight(vec3 pos) {
	float light = 0.0;

	const float R = 2.0;
	float light_density = particleLightDensity;
	vec2 uv;
	vec3 posParticle;

	for(float y=0.0; y<numParticles; y++) {
		for(float x=0.0; x<numParticles; x++) {
			uv = vec2(x, y)/numParticles * .5;
			posParticle = texture2D(texturePaticles, uv).xyz;

			float d = distance(pos, posParticle);
			if(d < R) {
				d = 1.0 - d/R;
				light += d * light_density * getDiffuse(vWsNormal, (posParticle - pos));
			}
		}
	}

	return light;
}


void main() {
	float particleLight = getParticleLight(vWsPosition);
	vec3 N 				= normalize( vWsNormal );
	vec3 V 				= normalize( vEyePosition );
	
	// deduce the diffuse and specular color from the baseColor and how metallic the material is
	vec3 diffuseColor	= uBaseColor - uBaseColor * uMetallic;
	vec3 specularColor	= mix( vec3( 0.08 * uSpecular ), uBaseColor, uMetallic );
	
	vec3 color;
	
	// sample the pre-filtered cubemap at the corresponding mipmap level
	float numMips		= 6.0;
	float mip			= numMips - 1.0 + log2(uRoughness);
	vec3 lookup			= -reflect( V, N );
	lookup				= fix_cube_lookup( lookup, 512.0, mip );
	vec3 radiance		= pow( textureCubeLodEXT( uRadianceMap, lookup, mip ).rgb, vec3( 2.2 ) );
	vec3 irradiance		= pow( textureCube( uIrradianceMap, N ).rgb, vec3( 1 ) );
	
	// get the approximate reflectance
	float NoV			= saturate( dot( N, V ) );
	vec3 reflectance	= EnvBRDFApprox( specularColor, uRoughness4, NoV );
	
	// combine the specular IBL and the BRDF
    vec3 diffuse  		= diffuseColor * irradiance;
    vec3 specular 		= radiance * reflectance;
	color				= diffuse + specular;

	vec3 _diffuse0 = getDiffuse(vWsNormal, LIGHT0, COLOR0) * .5;
	vec3 _diffuse1 = getDiffuse(vWsNormal, LIGHT1, COLOR1) * .5;

	color 				+= _diffuse0 + _diffuse1;
	
	float ao 			= texture2D(textureAO, vTextureCoord).r;
	color 				*= ao;
	color 				*= .5 + particleLight;

	// apply the tone-mapping
	color				= Uncharted2Tonemap( color * uExposure );
	// white balance
	color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );
	
	// gamma correction
	color				= pow( color, vec3( 1.0 / uGamma ) );

	// vec3 colorGray 		= grayscale(color);
	// color 				= mix(color, colorGray, .5);
	// color 				*= 1.3;

	const vec3 GRD_COLOR_0 = vec3(30.0, 28.0, 54.0)/255.0;
	const vec3 GRD_COLOR_1 = vec3(240.0, 234.0, 223.0)/255.0;

	float l = length(color.rgb) / length(vec3(1.0));
	vec3 colorGradient = mix(GRD_COLOR_0, GRD_COLOR_1, l);
	// color = mix(color, colorGradient, .5);


	// output the fragment color
    gl_FragColor		= vec4( color, 1.0 );

}