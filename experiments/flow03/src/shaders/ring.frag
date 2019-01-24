// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float uRatio;

void main(void) {
	vec2 diff = vTextureCoord - vec2(.5);
	// diff.x *= uRatio;
	float d = length(diff);
	d = abs(d - .1);
	d = smoothstep(0.01, 0.0, d);
    gl_FragColor = vec4(vec3(1.0), d);
}