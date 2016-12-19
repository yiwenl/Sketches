// terrain.frag

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureNormal;
uniform sampler2D textureHeight;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

#define LIGHT vec3(1.0, 1.0, 1.0)

void main(void) {
	vec3 N = texture2D(textureNormal, vTextureCoord).rbg * 2.0 - 1.0;
	N.rb *= -1.0;


	float d = diffuse(N, LIGHT);
	d = mix(d, 1.0, .5);
    gl_FragColor = vec4(vec3(d), 1.0);
    // gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(vTextureCoord, 1.0), .7);
    gl_FragColor.rgb *= mix(texture2D(textureHeight, vTextureCoord).rgb, vec3(1.0), .5);
}