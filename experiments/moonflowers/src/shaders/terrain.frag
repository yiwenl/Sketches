// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureNormal;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	vec3 N = texture2D(textureNormal, vTextureCoord).rgb;
	float d = diffuse(N, vec3(1.0));
	d = mix(d, 1.0, .25);
	
	gl_FragColor = vec4(vec3(d), 1.0);
    // gl_FragColor = texture2D(texture, vTextureCoord);
}