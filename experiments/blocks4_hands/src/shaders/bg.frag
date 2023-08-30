// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}


void main(void) {
    float n0 = rand(vTextureCoord * 5.0);
    float n = rand(vTextureCoord + n0);
    gl_FragColor = texture2D(texture, vTextureCoord);
    gl_FragColor.rgb -= n * 0.2;
}