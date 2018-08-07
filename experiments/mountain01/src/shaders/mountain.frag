// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;
uniform sampler2D textureNormal;
uniform vec3 uLight;
uniform vec3 uCameraPos;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}


#define PI 3.141592653

void main(void) {
	vec3 N = texture2D(textureNormal, vTextureCoord).rgb;

	// float noise = rand(gl_FragCoord.xy);
	float noise = rand(vTextureCoord);
	N.y += noise * 0.4;
	N = normalize(N);

	float d = diffuse(N, uLight);

	// d = mix(d, 1.0, .7);

	vec2 dir = normalize(vPosition.xz);
	vec2 dirCamera = normalize(uCameraPos.xz);
	float a = acos(dot(dir, dirCamera));

	float t = a < PI * 0.5 ? 0.5 : 1.0;


	gl_FragColor = vec4(vec3(d), 1.0);
	gl_FragColor = vec4(vec3(t * d), 1.0);
	// gl_FragColor = vec4(dir, 1.0, 1.0);
	// gl_FragColor = vec4(dirCamera, 1.0, 1.0);
	// gl_FragColor = vec4(vec3(noise), 1.0);
	// gl_FragColor = vec4(N, 1.0);
    // gl_FragColor = texture2D(texture, vTextureCoord);
}