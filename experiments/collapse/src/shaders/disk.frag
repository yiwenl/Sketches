// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUV;
uniform sampler2D texture;

void main(void) {
	
	vec2 uv      = vUV * .5 + .5;
	gl_FragColor = texture2D(texture, uv);
	// gl_FragColor = vec4(vUV, 0.0, 1.0);
    // gl_FragColor = vec4(vTextureCoord/5.0, 0.0, 1.0);
}