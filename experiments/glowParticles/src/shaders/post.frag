// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureMap;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}


void main(void) {
	vec3 color = texture2D(texture, vTextureCoord).rgb;
	float br = luma(color);
	// br = smoothstep(0.0, 0.5, br);
    gl_FragColor = texture2D(textureMap, vec2(br, .5));
    gl_FragColor.rgb *= 1.5;
}