// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;

const vec2 center = vec2(.5);

const vec3 color0 = vec3(0.5);
const vec3 color1 = vec3(0.15);

void main(void) {
	float d = distance(vTextureCoord, center);
	d = smoothstep(0.0, 0.5, d);
	vec3 color = mix(color0, color1, d);
    gl_FragColor = vec4(color, 1.0);
}