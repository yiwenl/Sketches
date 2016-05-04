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


vec3 mod289(vec3 x) {	return x - floor(x * (1.0 / 289.0)) * 289.0;	}

vec4 mod289(vec4 x) {	return x - floor(x * (1.0 / 289.0)) * 289.0;	}

vec4 permute(vec4 x) {	return mod289(((x*34.0)+1.0)*x);	}

vec4 taylorInvSqrt(vec4 r) {	return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 snoiseVec3( vec3 x ){

  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;

}


vec3 curlNoise( vec3 p ){
  
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );

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
		normalOffset 	= curlNoise(vWsPosition*200.0) * uNormalScale;
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