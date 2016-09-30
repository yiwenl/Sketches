precision mediump float;
varying vec4 vColor;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

#define threshold 0.5

void main(void) {
	if(distance(gl_PointCoord, vec2(.5)) > .5) discard;

	vec4 color = vColor;
    float br = luma(color.rgb);
    float tt = br;
    if(tt < threshold) tt = 0.0;

    gl_FragData[0] = vColor;
    gl_FragData[1] = vec4(br, br, br, 1.0);
    gl_FragData[2] = vec4(tt, tt, tt, 1.0);
    gl_FragData[3] = vec4(1.0);
}