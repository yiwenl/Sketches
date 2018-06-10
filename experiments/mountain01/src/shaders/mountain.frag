// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureNormal;
uniform vec3 uLight;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}


void main(void) {
	vec3 N = texture2D(textureNormal, vTextureCoord).rgb;

	// float noise = rand(gl_FragCoord.xy);
	float noise = rand(vTextureCoord);
	N.y += noise * 0.4;
	N = normalize(N);

	float d = diffuse(N, uLight);

	// d = mix(d, 1.0, .7);


	gl_FragColor = vec4(vec3(d), 1.0);
	// gl_FragColor = vec4(vec3(noise), 1.0);
	// gl_FragColor = vec4(N, 1.0);
    // gl_FragColor = texture2D(texture, vTextureCoord);
}