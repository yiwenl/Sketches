// post.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureBlur;

void main(void) {
	const float c = 0.475;
	float d = abs(vTextureCoord.y - c);
	d = smoothstep(0.2, 0.4, d);

	vec4 color = texture2D(texture, vTextureCoord);
	vec4 colorBlur = texture2D(textureBlur, vTextureCoord);

    gl_FragColor = mix(color, colorBlur, d);
    // gl_FragColor = colorBlur;
    // gl_FragColor = vec4(vec3(d), 1.0);
}