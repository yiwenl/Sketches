// dot.frag

#define SHADER_NAME DOTS_FRAG

precision highp float;
const vec2 center = vec2(.5);
varying vec3 vColor;
varying vec3 vNormal;
varying vec2 vTextureCoord;

const float PI = 3.141592657;
const float TwoPI = PI * 2.0;

void main(void) {
	if(distance(center, gl_PointCoord) > .5) discard;
  gl_FragColor = vec4(vColor, 1.0);
}