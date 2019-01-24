// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float uRatio;

void main(void) {
	vec2 v = vTextureCoord - vec2(.5);
	v.y /= uRatio;
	// v.x *= uRatio;

	float d = length(v);

	d = smoothstep(0.75, 0.0, d);

    gl_FragColor = vec4(vec3(d * 0.25), 1.0);
}