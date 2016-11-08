precision highp float;
varying vec4 vColor;
varying vec3 vPosition;
uniform float uClipY;
uniform float uDir;

void main(void) {
	if(vPosition.y * uDir > uClipY * uDir) {
		discard;
	}

	if(distance(gl_PointCoord, vec2(.5)) > .5) discard;
    gl_FragColor = vColor;
}