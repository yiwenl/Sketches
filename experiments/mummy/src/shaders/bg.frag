// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float luma(vec4 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}

void main(void) {
	vec3 color = vec3(1.0, 0.0, 0.0);

	float br = luma(color);


    gl_FragColor = texture2D(texture, vec2(br, 0.5));
}