// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform sampler2D texture;
uniform float useColor;
uniform vec3 uColor;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	vec4 color = texture2D(texture, vTextureCoord);
	color.rgb = mix(color.rgb, uColor, useColor);


	float d = diffuse(vNormal, vec3(1.0, 2.0, .8));
	d = mix(d, 1.0, .5);

	color.rgb *= d;
	
    gl_FragColor = color;

}