// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureDepth;
uniform float bias;
varying vec4 vShadowCoord;

void main(void) {
	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;

	vec2 uv = shadowCoord.xy;
	float d = texture2D(textureDepth, uv).r;

	float visibility = 1.0;
	if(d < shadowCoord.z - bias) {
		visibility = 0.5;
	}

	gl_FragColor = vec4(vec3(visibility), 1.0);
}