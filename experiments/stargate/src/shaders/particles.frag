// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

varying float vLife;
varying vec2 vTextureCoord;
const vec2 center = vec2(.5);

void main(void) {
	float d = distance(gl_PointCoord, center);
	d = max(0.5 - d, 0.0);

	d *= mix(vTextureCoord.y, 1.0, .25);
    // gl_FragColor = vec4(vec3(1.0), d);
    gl_FragColor = vec4(d);
}