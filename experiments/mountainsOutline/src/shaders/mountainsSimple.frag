// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUVNormal;
varying vec3 vUV;
varying vec4 vViewSpace;
varying vec4 vWsPosition;
varying vec3 vPosition;

uniform sampler2D textureColor0;
uniform sampler2D textureColor1;
uniform sampler2D textureNormal;
uniform sampler2D textureNoise;

uniform float 		uTime;
uniform float		uFogDensity;
uniform float 		uFogOffset;
uniform vec3        uFogColor;


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


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


const vec3 LIGHT = vec3(0.0, 20.0, -30.0);


float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}


void main(void) {
	vec2 uv          = vTextureCoord / 4.0 + vUV.xy;
	vec3 color0      = texture2D(textureColor0, uv).rgb;
	vec3 color1      = texture2D(textureColor1, uv).rgb;
	vec3 baseColor   = mix(color0, color1, vUV.z);
	
	vec3 N           = texture2D(textureNormal, vUVNormal).rgb;
	vec3 noiseNormal = texture2D(textureNoise, uv * 20.0).rgb;
	N                = normalize(N + noiseNormal * 0.5);
	
	
	float d          = diffuse(N, LIGHT);
	// d                = mix(d, 1.0, .7);
	vec3 color 		 = baseColor * d;
	
	// vec3 color            = baseColor;
	float fogDistance = length(vViewSpace);
	float fogAmount = fogFactorExp2(fogDistance, uFogDensity);

	color.rgb = mix(color.rgb, uFogColor, fogAmount+uFogOffset);
	
	// elevation fog
	const float posOffset = 0.7;
	float noise           = 0.0;
	float yOffset         = smoothstep(3.0, 0.0, vPosition.y);
	noise                 *= yOffset * .5;
	noise                 += pow(yOffset, 3.0);
	noise                 = clamp(noise, 0.0, 1.0);
	color                 = mix(color, uFogColor, noise);
	
	gl_FragColor          = vec4(color, 1.0);
}