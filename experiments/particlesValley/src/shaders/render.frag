precision highp float;
varying vec4 vColor;
uniform float uInvertOffset;

void main(void) {
	if(vColor.a <= 0.01) discard;
	if(distance(gl_PointCoord, vec2(.5)) > .5) discard;

	vec3 invertColor = vec3(1.0 - vColor.rgb);
	vec3 finalColor = vColor.rgb;
	finalColor.b *= 0.975;
	finalColor = mix(finalColor, invertColor, uInvertOffset);


    gl_FragColor = vec4(finalColor, vColor.a);
}