// drawing.frag


#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uSaturation;


void main(void) {
    vec3 color = texture2D(texture, vTextureCoord).rgb;
	float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
	vec3 colorGray = vec3(gray);
	color = mix(colorGray, color, 1.0 - uSaturation);
	gl_FragColor = vec4(color, 1.0);
}