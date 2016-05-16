precision highp float;
varying vec4 vColor;
varying vec3 vExtra;

void main(void) {
	if(distance(gl_PointCoord, vec2(.5)) > .5) discard;
	if(vColor.a <= 0.0) discard;

	vec4 color = vColor;
	// color.rgb *= mix(vExtra.g, 1.0, .75);
    gl_FragColor = color;
}