// grassSimple.frag

#define SHADER_NAME GRASS_FRAGMENT

precision mediump float;

uniform sampler2D textureGrass;
varying vec2 vTextureCoord;
varying vec3 vColor;
varying vec3 vNormal;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const vec3 LIGHT = vec3(5.0, 5.0, 0.0);

void main(void) {
	vec4 texel = texture2D(textureGrass, vTextureCoord);
	if(texel.a < 0.75) discard;
	float g = smoothstep(-0.1, 0.5, vTextureCoord.y);
    gl_FragColor = vec4(vColor * g, 1.0) * texel;
}