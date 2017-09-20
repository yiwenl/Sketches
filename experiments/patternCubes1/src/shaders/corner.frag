// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float num;

void main(void) {
	vec2 uv = floor((vTextureCoord + 0.5/num) * num);

	float t = max(uv.x, uv.y);
	float d = mod(t, 2.0);
	d = step(.9, d);

    gl_FragColor = vec4(vec3(1.0 - d), 1.0);
}