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

void main() {
	gl_FragColor = bloomStrength * ( 
		lerpBloomFactor(bloomTintColors[0].a) * vec4(bloomTintColors[0].rgb, 1.0) * texture2D(blurTexture1, vTextureCoord) + 
		lerpBloomFactor(bloomTintColors[1].a) * vec4(bloomTintColors[1].rgb, 1.0) * texture2D(blurTexture2, vTextureCoord) + 
		lerpBloomFactor(bloomTintColors[2].a) * vec4(bloomTintColors[2].rgb, 1.0) * texture2D(blurTexture3, vTextureCoord) + 
		lerpBloomFactor(bloomTintColors[3].a) * vec4(bloomTintColors[3].rgb, 1.0) * texture2D(blurTexture4, vTextureCoord) + 
		lerpBloomFactor(bloomTintColors[4].a) * vec4(bloomTintColors[4].rgb, 1.0) * texture2D(blurTexture5, vTextureCoord) 
	);
/*
	gl_FragColor = vec4(vec3(bloomRadius), 1.0);

	float gap = 0.2;

	if(vTextureCoord.x < gap) {
		gl_FragColor = vec4(vec3(bloomTintColors[0].a), 1.0);
	} else if(vTextureCoord.x < gap * 2.0) {
		gl_FragColor = vec4(vec3(bloomTintColors[1].a), 1.0);
	} else if(vTextureCoord.x < gap * 3.0) {
		gl_FragColor = vec4(vec3(bloomTintColors[2].a), 1.0);
	} else if(vTextureCoord.x < gap * 4.0) {
		gl_FragColor = vec4(vec3(bloomTintColors[3].a), 1.0);
	} else {
		gl_FragColor = vec4(vec3(bloomTintColors[4].a), 1.0);
	}
*/	
}