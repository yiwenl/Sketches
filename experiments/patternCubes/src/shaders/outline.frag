// copy.frag

precision highp float;
varying vec2 vTextureCoord;
uniform float range;

void main(void) {
	vec2 uv = abs(vTextureCoord - .5)/.5;
	// float range = 0.2;
	uv.x = step(1.0 - range, uv.x);
	uv.y = step(1.0 - range, uv.y);

	float d = max(uv.x, uv.y);


    gl_FragColor = vec4(vec3(0.0), d);
}