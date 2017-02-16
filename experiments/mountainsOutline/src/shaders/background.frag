// background.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureNext;
uniform vec3 uFogColor;
uniform float uOffset;

void main(void) {
	vec4 fogColor = vec4(uFogColor, 1.0);
	float p       = smoothstep(0.6, 0.4, vTextureCoord.y);
	
	vec4 curr     = texture2D(texture, vTextureCoord);
	vec4 next     = texture2D(textureNext, vTextureCoord);
	
	gl_FragColor  = mix(curr, next, uOffset);
	gl_FragColor  = mix(gl_FragColor, fogColor, p);
}