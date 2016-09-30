// dome.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;

void main(void) {
	vec3 colorCurr = texture2D(textureCurr, vTextureCoord).rgb;
	vec3 colorNext = texture2D(textureNext, vTextureCoord).rgb;

    // gl_FragColor = vec4(vTextureCoord, .5, 1.0);
    gl_FragColor = vec4(colorCurr, 1.0);
}