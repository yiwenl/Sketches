// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vExtra;
varying float vAlpha;
uniform sampler2D texture;
uniform float time;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {

	vec2 uv = gl_PointCoord - vec2(.5);
	uv = rotate(uv, vExtra.r + time);
	uv += vec2(.5);

    vec4 color = texture2D(texture, uv);

    color.a *= 0.5 * vAlpha;

    if(color.a <= 0.05) discard;

    gl_FragColor = color;
}