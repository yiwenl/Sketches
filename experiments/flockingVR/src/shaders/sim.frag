// sim.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D textureVel;
uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform float time;
uniform float maxRadius;
uniform float maxY;

uniform float lowThreshold;
uniform float highThreshold;
uniform float minRadius;
uniform float maxSpeed;
uniform float minSpeed;

uniform vec3 uHit;
uniform float uHitRadius;
uniform float uHitVel;

#define NUM 64
#define PI 3.141592653


vec3 mod289(vec3 x) {	return x - floor(x * (1.0 / 289.0)) * 289.0;	}

vec4 mod289(vec4 x) {	return x - floor(x * (1.0 / 289.0)) * 289.0;	}

vec4 permute(vec4 x) {	return mod289(((x*34.0)+1.0)*x);	}

vec4 taylorInvSqrt(vec4 r) {	return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

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

vec3 boundaryCheck(vec3 pos, inout vec3 acc, float speedOffset) {
	float dist = length(pos.xz);
	if(dist > maxRadius) {
		vec2 dir = normalize(pos.xz);
		float f = pow(2.0, (dist - maxRadius) * 3.0) * 0.0025 * speedOffset;
		acc.xz -= dir * f;
	}

	dist = abs(pos.y);

	if(dist > maxY) {
		float dir = normalize(pos.y);
		float f = pow(2.0, (dist - maxY) * 3.0) * 0.0025 * speedOffset;
		acc.y -= dir * f;
	}

	return acc;
}


vec3 hitCheck(vec3 pos, inout vec3 acc, float speedOffset) {
	float r1 = uHitRadius * 2.0;
	float r2 = uHitRadius * 3.0;
	float r3 = uHitRadius * 4.0;
	float distToHit = distance(pos, uHit);
	vec3 dir = normalize(uHit - pos);
	if(distToHit < uHitRadius)  {
		float f = pow(2.0, (uHitRadius - distToHit) * 2.0 ) * 2.0;
		acc -= dir * f;
	} else {
		float f = smoothstep(r1, r2, distToHit);
		f = sin(f * PI) * 0.5;
		acc += dir * f;
	}

	if(distToHit < r3) {
		// float scare = smoothstep(0.25, 1.0, uHitVel);
		float scare = smoothstep(0.2, 0.75, uHitVel);
		float offset = 1.0 - distToHit / r3;
		acc -= dir * scare * 20.0 * offset;
	}
	

	return acc;
}

float getDelta(float s, float e, float v) {
	return (v - s) / (e - s);
}

void main(void) {
	vec3 pos        = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel        = texture2D(textureVel, vTextureCoord).rgb;
	vec3 extra      = texture2D(textureExtra, vTextureCoord).rgb;
	float posOffset = mix(extra.r, 1.0, .5) * .1;
	float speedOffset = mix(extra.b, 1.0, .75);
	float speed = length(vel);

	float pMaxSpeed = maxSpeed * speedOffset;
	float pMinSpeed = minSpeed * speedOffset;

	vec3 acc = vec3(0.0);
	vec3 noise = curlNoise(pos * posOffset + time * 0.25) * .05;
	acc += noise;

	float dist, p, f, delta, speedParticle;
	vec2 uvParticle;
	vec3 posParticle, velParticle, dir;
	float _num = float(NUM);

	float offset = sin(extra.g + speedOffset * time * 0.2 );
	float radius = minRadius * mix(extra.b, 1.0, 0.8 + offset * .2);

	for( int i=0; i<NUM; i++) {
		for( int j=0; j<NUM; j++) {
			vec2 uvParticle = vec2( float(i)/_num, float(j)/_num);

			posParticle = texture2D(texturePos, uvParticle).xyz;
			dist = distance(pos, posParticle);
			if(dist > radius) { continue; }
			if(dist <= 0.0) { continue; }

			p = dist / radius;
			dir = normalize(posParticle - pos);


			if(p < lowThreshold) {
				delta = getDelta(0.0, lowThreshold, p);
				f = 1.0 / delta * 0.01;
				acc -= dir * f;

			} else if(p < highThreshold) {
				delta = getDelta(lowThreshold, highThreshold, p);

				velParticle = texture2D(textureVel, uvParticle).xyz;

				dir = mix(vel, velParticle, .5);
				f = sin(delta * PI);
				acc += dir * f * 0.005;

			} else {
				delta = getDelta(highThreshold, 1.0, p);
				delta = sin( delta * PI );

				f = pow(delta, 1.) * 0.001;
				acc += dir * f;
			}
		}
	}
	
	
	boundaryCheck(pos, acc, speedOffset);
	hitCheck(pos, acc, speedOffset);
	
	vel += acc * .04 * speedOffset;
	const float decrease = .98;
	vel *= decrease;

	
	if(speed > pMaxSpeed) {
		vel = normalize(vel) * pMaxSpeed;
	} 

	if(speed < pMinSpeed) {
		vel = normalize(vel) * pMinSpeed;
	} 

	
	// if(distance(pos,uHit) < uHitRadius) {
	// 	vel *= 0.0;
	// }
	

	pos += vel;

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
	gl_FragData[3] = vec4(0.0, 0.0, 0.0, 1.0);
}