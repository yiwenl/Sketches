// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;


vec3 power(vec3 value, float s) {
	return vec3(
		pow(value.r, s),
		pow(value.g, s),
		pow(value.b, s)
	);
}


void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);

    color.rgb += 0.65;
    // color.rgb = power(color.rgb, 3.0);

    gl_FragColor = color;
}