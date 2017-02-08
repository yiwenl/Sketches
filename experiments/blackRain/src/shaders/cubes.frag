// cubes.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vScale;
uniform sampler2D texture;


#define PI 3.141592653
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
	if(vScale <= 0.0) {
		discard;
	}
	vec2 uv = envMapEquirect(vNormal);
	vec3 light = texture2D(texture, uv).rgb + 0.3;
  // light = mix(light, vec3(1.0), .3);

  gl_FragColor = vec4(light, 1.0);
}