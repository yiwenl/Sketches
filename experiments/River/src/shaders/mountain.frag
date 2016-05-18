// mountain.frag
#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;

void main(void) {
	const float MIN_Y = 0.005;
	float opacity = smoothstep(0.0, MIN_Y, abs(vPosition.y));
    gl_FragColor = texture2D(texture, vTextureCoord);
    gl_FragColor *= opacity;
}