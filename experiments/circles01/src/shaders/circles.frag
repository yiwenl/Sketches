// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vDebug;

void main(void) {
	float dist = distance(vTextureCoord, vec2(.5));
	if( dist > .5 * vDebug.x) {
		discard;
	}

    // gl_FragColor = vec4(vDebug, 1.0);
    gl_FragColor = vec4(1.0);
}