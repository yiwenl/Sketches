precision highp float;
varying vec2 vTextureCoord;
uniform float num;

void main(void) {

	float d = floor((vTextureCoord.y + 0.5/num) * num);
	d = step(mod(d, 2.0), .9);

	gl_FragColor = vec4(vec3(d), 1.0);
}