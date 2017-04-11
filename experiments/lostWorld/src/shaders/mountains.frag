// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;

uniform sampler2D texture;
uniform float elevation;
uniform vec3 fogColor;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const vec3 L = vec3(1.0);




void main(void) {
	vec3 color = texture2D(texture, vUV).rgb;

	float d = diffuse(vNormal, L);
	color *= mix(d, 1.0, .25);


	float t = smoothstep(elevation + vNoise * .5, 0.0, vPosition.y);
	t = pow(t, 3.0);
	color = mix(color, fogColor, t);


    gl_FragColor = vec4(color, 1.0);
}