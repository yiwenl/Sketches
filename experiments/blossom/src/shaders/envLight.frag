// envLight.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D 	texture;
uniform sampler2D 	textureNext;
uniform sampler2D 	uAoMap;
uniform float 		offset;
uniform vec3 		uBaseColor;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;

const float PI = 3.141592657;
const float TwoPI = PI * 2.0;


vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  //I assume envMap texture has been flipped the WebGL way (pixel 0,0 is a the bottom)
  //therefore we flip wcNorma.y as acos(1) = 0
  float phi = acos(-wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / TwoPI, phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    //-1.0 for left handed coordinate system oriented texture (usual case)
    return envMapEquirect(wcNormal, -1.0);
}

void main(void) {
	vec3 baseColor = texture2D(uAoMap, vTextureCoord).rgb * 1.0 * uBaseColor;

	vec2 uv = envMapEquirect(vWsNormal);
	vec3 colorNow = texture2D(texture, uv).rgb;
	vec3 colorNext = texture2D(textureNext, uv).rgb;

	vec3 color = mix(colorNow, colorNext, offset);
	baseColor += color * .5;

    gl_FragColor = vec4(baseColor, 1.0);
}