// shadow.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec4 vColor;

const vec2 center = vec2(.5);

void main(void) {
	if(distance(gl_PointCoord, center) > .5) discard;
    gl_FragColor = vColor;
}