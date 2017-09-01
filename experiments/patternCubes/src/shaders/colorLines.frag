precision highp float;
varying vec2 vTextureCoord;
uniform float angle;
uniform float size;
uniform float numBars;
uniform vec3 color0;
uniform vec3 color1;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec2 uv = vTextureCoord;
	uv.y += 10.0/numBars;
	uv = rotate(uv - .5, angle) + .5;

	float g = fract(uv.y * numBars);
	g = step(size, g);

	float t = vTextureCoord.x;
	vec3 color = mix(color0, color1, t) * g;

    gl_FragColor = vec4(color, 1.0);
}