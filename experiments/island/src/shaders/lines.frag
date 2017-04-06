// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying float vAlpha;
uniform sampler2D texture;

uniform vec3 color;
uniform float opacity;

void main(void) {
	if(vAlpha <= 0.0) discard;
    gl_FragColor = vec4(color, opacity * vAlpha);
}