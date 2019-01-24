// copy.frag

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
varying vec4 vShadowCoord;
varying vec4 vWsPosition;
varying float vShadow;
varying vec3 vPositionOrg;

uniform sampler2D textureDepth;
uniform float uSize;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform float uPercent;
uniform float uNum;
uniform float uNumSlices;
uniform float uOffset;


#define uMapSize vec2(512.0)

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



vec2 getUVOffset(float index) {
	float x = mod(index, uNum);
	float y = floor(index/uNum);
	return vec2(x, y) / uNum;
}

vec3 texture3D(vec3 pos, sampler2D texture) {
	vec3 posAdj = (pos * .25 + .5);
	
	float tz    = posAdj.z;
	float num   = uNum * uNum;
	
	float i0    = floor(tz * num);
	float i1    = ceil(tz * num);
	vec2 uv0    = posAdj.xy / uNum + getUVOffset(i0);
	vec2 uv1    = posAdj.xy / uNum + getUVOffset(i1);
	vec3 color0 = texture2D(texture, uv0).xyz;
	vec3 color1 = texture2D(texture, uv1).xyz;
	float p     = mod(tz * num - i0, 1.0);
	vec3 color  = mix(color0, color1, p);
	
	color       /= uNumSlices;
	return color;
}


vec3 power(vec3 v, float p) {
	return vec3(
			pow(v.x, p),
			pow(v.y, p),
			pow(v.z, p)
		);
}


void main(void) {
	vec3 pos = vPosition / uSize * .5 + .5;
	vec3 color0 = texture3D(pos, texture0);
	vec3 color1 = texture3D(pos, texture1);
	vec3 color = mix(color0, color1, uPercent);
	

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	vec2 uv = shadowCoord.xy;
	float bias = 0.005;
	float d = texture2D(textureDepth, uv).r;
	float s = 1.0;
	if(d < shadowCoord.z - bias) {
		s = 0.0;
	}

	float bottomOffset = smoothstep(-0.5, 0.0, vPositionOrg.y);
	float topOffset = smoothstep(1.0, 1.5, vPositionOrg.y);
	color *= bottomOffset;
	color.r -= topOffset;
	color.r = max(color.r, 0.0);

	color = power(color.rrr + 0.01, 1.0 + uOffset) * 2.0;
	// color = power(vec3(topOffset, 1.0 + uOffset) * 2.0;

	// color *= pos.y;



    
    // gl_FragColor = vec4(color , 1.0 -s);
    gl_FragColor = vec4(color * s , 1.0);
    // gl_FragColor = vec4(vec3(1.0), s * 0.1);
    
    // gl_FragColor = vec4(vec3(d, 0.0, 0.0), mix(shadow, 1.0, .2));

    // gl_FragColor = vec4(vec3(1.0), 1.0 - smoothstep(0.0, 1.0, d));
}