// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE
#define NUM ${NUM}

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureExtra;
uniform float uMaxRadius;
uniform float uTime;
uniform vec3 uHit;
uniform float uHitForce;
uniform float uDrawDistance;
uniform float uDrawForce;
uniform float uFishCapY;
uniform float uRadius;
uniform float uMinThreshold;
uniform float uMaxThreshold;
uniform vec3 uCenter;


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


#define PI 3.141592653

void main(void) {
	vec2 uv = vTextureCoord;
	vec2 uvOffset = vec2(0.5, 0.0);
	vec3 pos, vel, color;
	vec3 extra = texture2D(texture, vTextureCoord).xyz;

	if(vTextureCoord.x < 0.5) {	//	pos
		
		pos = texture2D(texture, uv).xyz;
		vel = texture2D(texture, uv + uvOffset).xyz;

		pos = pos + vel;
		if(pos.y > uFishCapY) {
			pos.y = uFishCapY;
		}

		color = pos;

	} else { //	vel
		pos = texture2D(texture, uv - uvOffset).xyz;
		vel = texture2D(texture, uv).xyz;

		float posOffset = 0.5;
		float time = mod(uTime * 0.1, 1.0);
		vec3 acc = curlNoise(vec3(pos.xz * posOffset, time));
		acc.y *= 0.01;

		vec2 uvParticle;
		vec3 posParticle, velParticle, dir;
		float _num = float(NUM);
		float dist, p, f;

		for(int i=0; i<NUM; i++) {
			for(int j=0; j<NUM; j++) {
				uvParticle = vec2(float(i) / _num, float(j)/_num) * vec2(0.5, 1.0);
				posParticle = texture2D(texture, uvParticle).xyz;
				velParticle = texture2D(texture, uvParticle + vec2(0.5, 0.0)).xyz;

				dir = posParticle - pos;
				dist = length(dir);

				if(dist < uRadius && dist > 0.0) {

					dir = normalize(dir);	
					p = dist / uRadius;

					if(p < uMinThreshold) {	//	repel
						f = 1.0 / p;
						acc -= dir * f * 0.05;
					} else if( p < uMaxThreshold) {
						p = ( p - uMinThreshold) / (uMaxThreshold - uMinThreshold);	
						f = sin(p * PI);
						dir = mix(vel, velParticle, f * 0.5);
						if(length(dir) > 0.0) {
							acc += normalize(dir) * 0.01;	
						}
					} else {
						p = ( p - uMaxThreshold) / (1.0 - uMaxThreshold);
						f = sin(p * PI);
						acc += dir * f * 0.01;
					}
				}
			}
		}



		//	prevent go over surface
		f = smoothstep(-0.5, 0.0, pos.y);
		acc.y -= f * 2.0;

		f = smoothstep(-1.0, -2.0, pos.y);
		acc.y += f;
		

		//	pulling force to touch
		float d = distance(pos, uHit);
		f = smoothstep(uDrawDistance, 0.0, d);
		f = sin(f * PI);
		dir = normalize(pos - uHit);
		acc -= dir * uDrawForce * f * uHitForce;	


		//	prevent going over
		d = distance(pos.xz, uCenter.xz);
		float r = uMaxRadius * 0.25;
		if(d > r) {
			float f = (d - r) * 0.7;
			vec2 dir = normalize(pos.xz);
			acc.xz -= dir * f;
		}

		float speed = mix(extra.b, 1.0, .14);
		vel += acc * 0.002 * speed;

		float decreaseRate = 0.99;
		vel *= decreaseRate;

		float maxSpeed = 1.0;
		if(length(vel) > maxSpeed) {
			vel = normalize(vel) * maxSpeed;
		} 

		color = vel;
	}

		gl_FragColor = vec4(color, 1.0);
}