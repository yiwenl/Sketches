// render.frag

precision highp float;

varying vec4 vColor;
varying vec2 vPointCoord;


void main(void) {
	if(vColor.a <= 0.01) {
		discard;
	}
	if(distance(vPointCoord, vec2(.5)) > .5) {
		discard;
	}
    gl_FragColor = vColor;
}