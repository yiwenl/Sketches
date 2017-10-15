// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

uniform sampler2D texture;
uniform float uOpacity;

varying vec2 vTextureCoord;
varying vec4 vShadowCoord;

void main(void) {
	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	vec2 uv = shadowCoord.xy;

    gl_FragColor = texture2D(texture, uv);
    gl_FragColor.a *= uOpacity;
}