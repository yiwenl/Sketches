precision highp float;
varying vec2 vTextureCoord;

void main(void) {

	float d = vTextureCoord.x * vTextureCoord.y;
	d = smoothstep(-.25, 1.0, d);
	d = pow(d, 3.0);

    gl_FragColor = vec4(vec3(d), 1.0);
}