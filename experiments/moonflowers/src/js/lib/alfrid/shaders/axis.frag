// axis.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision lowp float;
varying vec3 vColor;
varying vec3 vNormal;

void main(void) {
	// vec3 color = vNormal;
	vec3 color = vColor + vNormal * 0.0001;
    gl_FragColor = vec4(color, 1.0);
}