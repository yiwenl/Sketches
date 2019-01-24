// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform float uFade;
uniform float uSpread;

float contrast(float v, float s) {
	return ( v - .5 ) * s + .5;
}

vec2 contrast(vec2 v, float s) {
	return vec2(
			contrast(v.x, s),
			contrast(v.y, s)
		);
}

void main(void) {
	vec2 uv = contrast(vTextureCoord, uSpread);
    vec4 color0 = texture2D(texture0, uv);
    vec4 color1 = texture2D(texture1, vTextureCoord);
    color0.rgb *= uFade;
    // color0.a -= uFade * 0.001;
    // color0.rgb *= uFade;
    // gl_FragColor = mix(color0, color1, color1.a);
    gl_FragColor = color0 + color1;
}