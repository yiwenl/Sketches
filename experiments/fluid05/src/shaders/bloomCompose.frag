// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

#define NUM_MIPS ${NUM_MIPS}

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;

uniform float bloomStrength;
uniform float bloomRadius;
uniform vec4 bloomTintColors[NUM_MIPS];

float lerpBloomFactor(const in float factor) { 
	float mirrorFactor = 1.2 - factor;
	return mix(factor, mirrorFactor, bloomRadius);
}

vec4 getBloom() {
	vec4 color = vec4(0.0);
	${BLOOMS}
	return color;
}

void main() {
	gl_FragColor = bloomStrength * getBloom();
}