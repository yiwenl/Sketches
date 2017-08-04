// terrain.frag

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D 	texture;
uniform sampler2D 	textureNoise;
uniform sampler2D 	uAoMap;
uniform mat3 		uNormalMatrix;
uniform float 		noiseScale;
uniform float 		colorOffset;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;

const float PI = 3.141592657;
const float TwoPI = PI * 2.0;


vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  float phi = acos(-wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / TwoPI, phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    return envMapEquirect(wcNormal, -1.0);
}


const vec3 light = vec3(1.0, 0.005, 1.0);

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}

void main(void) {
	vec3 baseColor = texture2D(uAoMap, vTextureCoord).rgb;

	vec3 noise = texture2D(textureNoise, vTextureCoord * 10.0).rgb * 2.0 - 1.0;
	vec3 N = normalize(vWsNormal + noise * noiseScale);

	vec2 uv = envMapEquirect(N);
	vec3 color = texture2D(texture, uv).rgb;
	float d = diffuse(uNormalMatrix * vWsNormal, light);
	baseColor *= d;
	baseColor += (colorOffset * .5);
	baseColor += color * .75;

    gl_FragColor = vec4(baseColor, 1.0);
}