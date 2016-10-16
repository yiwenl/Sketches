// floor.frag

precision highp float;
varying vec2 vTextureCoord;

#define center vec2(.5)
#define radius .2
#define range .3

void main(void) {
	float d = distance(vTextureCoord, center);

	float a = smoothstep(radius + range, radius, d);

    gl_FragColor = vec4(1.0, 1.0, 1.0, a);
}