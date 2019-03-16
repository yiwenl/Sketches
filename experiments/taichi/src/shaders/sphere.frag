// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;

uniform sampler2D texture;
uniform float uThreshold;

void main(void) {
	float r = 0.01 * uThreshold;
	float g = smoothstep(-r, r, vPosition.x);
    gl_FragColor = vec4(vec3(g), 1.0);
}