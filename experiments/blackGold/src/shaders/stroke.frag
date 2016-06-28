// stoke.frag

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

void main(void) {
	vec4 color = texture2D(texture, vTextureCoord);
	float br = length(color.rgb);
	if(br < 0.5) discard;

	float grey = (color.r + color.g + color.b) / 3.0;
    gl_FragColor = vec4(vec3(grey), color.a);
}