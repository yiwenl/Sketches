// stars.frag


#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

varying vec2 vTextureCoord;
varying vec3 vPosition;

uniform sampler2D texture;
uniform float uClipY;
uniform float uDir;

void main(void) {
	if(vPosition.y * uDir > uClipY * uDir) {
		discard;
	}
    gl_FragColor = texture2D(texture, vTextureCoord);
}