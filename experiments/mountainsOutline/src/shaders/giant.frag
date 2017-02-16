// pbr.frag

#define SHADER_NAME FRAG_GIANT
#extension GL_EXT_shader_texture_lod : enable

precision highp float;

uniform sampler2D 	uAoMap;
uniform sampler2D 	uMatMap;
uniform sampler2D 	video0;
uniform sampler2D 	video1;
uniform sampler2D 	video2;
uniform sampler2D 	video3;
uniform samplerCube uRadianceMap;
uniform samplerCube uIrradianceMap;

uniform vec3		uFogColor;
#define uRoughness 	1.0
#define uMetallic 	0.0
#define uSpecular 	0.0
#define uFogDensity 0.05
#define uFogOffset 	0.01

uniform float 		uFogHeight;
uniform float 		uOpacity;

varying vec3        vNormal;
varying vec3        vPosition;
varying vec3		vEyePosition;
varying vec3		vWsNormal;
varying vec3		vWsPosition;
varying vec2 		vTextureCoord;
varying vec4 		vCoords;
varying vec4 		vViewSpace;
varying vec3 		vOrgPosition;

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

vec4 permute(vec4 x) {  return mod(((x*34.0)+1.0)*x, 289.0);    }
vec4 taylorInvSqrt(vec4 r) {    return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

float snoise(float x, float y, float z){
    return snoise(vec3(x, y, z));
}


vec3 getBlend(vec3 base, vec3 color, float offset) {
	vec3 finalColor = mix(base, color, offset);

	return finalColor;
}

vec3 getBaseColor() {
	vec4 coord           = vCoords / vCoords.w;
	const float dropBias = .00005;

	vec3 colorBlend 	= texture2D(uMatMap, vTextureCoord).rgb;
	float amtBase		= 1.0 - (colorBlend.r + colorBlend.g + colorBlend.b);

	vec3 colorBase 		= texture2DProj(video3, coord, dropBias).rgb;
	vec3 colorRed 		= texture2DProj(video0, coord, dropBias).rgb;
	vec3 colorGreen 	= texture2DProj(video1, coord, dropBias).rgb;
	vec3 colorBlue 		= texture2DProj(video2, coord, dropBias).rgb;

	vec3 finalColor;

	if(colorBlend.r > 0.5) {
		finalColor = getBlend(colorBase, colorRed, colorBlend.r);
	} else if(colorBlend.g > 0.5) {
		finalColor = getBlend(colorBase, colorGreen, colorBlend.g);
	} else if(colorBlend.b > 0.5) {
		finalColor = getBlend(colorBase, colorBlue, colorBlend.b);
	} else {
		finalColor = colorBase;
	}

	return finalColor;
}


float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}


void main() {
	vec3 N 				= normalize( vWsNormal );
	vec3 V 				= normalize( vEyePosition );

	vec4 coord           = vCoords / vCoords.w;
	const float dropBias = .00005;

	vec3 matColor 		= getBaseColor();
	vec3 color 			= getPbr(N, V, vec3(1.0), uRoughness, uMetallic, uSpecular);
	vec3 ao 			= texture2D(uAoMap, vTextureCoord).rgb;
	color 				*= matColor;
	color 				*= ao;


	float fogDistance = length(vViewSpace);
	float fogAmount = fogFactorExp2(fogDistance, uFogDensity);

	color.rgb = mix(color.rgb, uFogColor, fogAmount+uFogOffset);

	const float posOffset 	= 0.5;
	float noise 		= snoise(vWsPosition * posOffset) * .5 + .5;
	float yOffset 		= smoothstep(2.5 + uFogHeight, 0.0 + uFogHeight, vPosition.y);
	noise 				*= yOffset * .5;
	noise 				+= pow(yOffset, 3.0);
	noise 				= clamp(noise, 0.0, 1.0);
	vec3 colorBlend 	= texture2D(uMatMap, vTextureCoord).rgb;
	color 				= mix(color, uFogColor, noise);

    gl_FragColor		= vec4( color, uOpacity );
}