// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vDebug;
varying vec3 vColor;
uniform float uUseColor;

void main(void) {
	float dist = distance(vTextureCoord, vec2(.5));
	if( dist > .5 * vDebug.x) {
		discard;
	}

	vec3 color = mix(vec3(1.0), vColor, uUseColor);

	gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(1.0);
}