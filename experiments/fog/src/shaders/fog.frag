// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE
#define NUM ${NUM}
#define PI 3.141592653

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
varying vec4 vWsPosition;
uniform sampler2D texture0;
uniform sampler2D texture1;


uniform float uLightIntensity;
uniform float uPercent;
uniform vec3 uOrigin;
uniform vec3 uDir;
uniform float uNumSlices;
uniform float uSize;
uniform float uNum;
uniform float uOffset;
uniform mat4 uModelMatrix;

uniform vec3 uLightOrigin[NUM];
uniform vec3 uLightDir[NUM];
uniform vec3 uLightColor[NUM];


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

vec3 getLight(vec3 origin, vec3 dir, vec3 color) {
	vec3 pos = vWsPosition.xyz;

	vec3 vFromOrigin = pos - origin;
	vec3 dirFromOrgin = normalize(vFromOrigin);
	float angle = acos(dot(dirFromOrgin, dir));
	float offset = angle < PI * 0.25 ? 1.0 : 0.0;

	float distToLine = sin(angle) * length(vFromOrigin);
	float distToIntersect = cos(angle) * length(vFromOrigin);
	distToIntersect = max(distToIntersect, 0.0);
	float fallOff = smoothstep(4.0, 0.0, distToIntersect);

	distToIntersect *= 0.25;
	float d = smoothstep(distToIntersect * 2.0, distToIntersect, distToLine);
	d = pow(d, 2.0);
	d *= offset * fallOff * 5.0;

	// return color * d;

	float t = length(vPosition);
	t = smoothstep(3.5, 0.0, t);

	// return vec3(t);
	return mix(vec3(t * 0.1), color, d);
}


vec3 getLight(vec3 origin, vec3 dir) {
	return getLight(origin, dir, vec3(1.0));
}


void main(void) {

	vec3 light = vec3(0.0);
	for(int i=0; i<NUM; i++) {
		vec3 origin     = (uModelMatrix * vec4(uLightOrigin[i], 1.0)).xyz;
		vec3 dir        = uLightDir[i];
		vec3 lightColor = uLightColor[i];
		light           += getLight(origin, dir, lightColor) * uLightIntensity;
	}

	vec3 pos           = vWsPosition.xyz;
	vec3 normalizedPos = pos / uSize * .5 + .5;
	vec3 color0        = texture3D(normalizedPos, texture0);
	vec3 color1        = texture3D(normalizedPos, texture1);
	
	vec3 color         = mix(color0, color1, uPercent);
	color              = power(color.rrr * light + light * 0.02, 1.0 + uOffset);
	
	gl_FragColor       = vec4(color, 1.0);
}