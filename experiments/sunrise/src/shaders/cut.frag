// cut.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
	float a = 1.0 - texture2D(texture, vTextureCoord).a; 
	a = smoothstep(.0, .5, a);
    gl_FragColor = vec4(vec3(1.0), a);
    // gl_FragColor = texture2D(texture, vTextureCoord);
}