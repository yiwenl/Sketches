// dot.frag

#define SHADER_NAME DOTS_FRAG

precision highp float;
const vec2 center = vec2(.5);
varying vec3 vColor;
varying vec3 vNormal;
varying vec2 vTextureCoord;
uniform sampler2D textureLight;

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
	if(distance(center, gl_PointCoord) > .5) discard;

	vec2 uv = envMapEquirect(vNormal.xzy);
	vec3 colorLight = texture2D(textureLight, uv).rgb;
	colorLight = mix(colorLight, vec3(1.0), .2);
	
    gl_FragColor = vec4(vColor * colorLight, 1.0);
    // gl_FragColor = vec4(uv, 0.0, 1.0);
    // gl_FragColor = vec4(vNormal * .5 + .5, 1.0);
}