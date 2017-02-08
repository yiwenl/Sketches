// terrain.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

uniform sampler2D textureHeight;
uniform float uClipY;
uniform float uDir;

varying vec2 vTextureCoord;
varying float vHeight;
varying vec3 vPosition;

void main(void) {
	if(vPosition.y * uDir > uClipY * uDir) {
		discard;
	}
    gl_FragColor = texture2D(textureHeight, vTextureCoord);
}