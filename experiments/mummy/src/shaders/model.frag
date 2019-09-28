// copy.frag

#extension GL_EXT_draw_buffers : require 

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
varying vec3 vNormal;
uniform sampler2D texture;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


// #define LIGHT vec3(0.4, 0.7, 0.5)
#define LIGHT vec3(0.0, 10.0, 5.0)

void main(void) {
	float d = diffuse(vNormal, LIGHT);
	d = mix(d, 1.0, .5);

	vec2 uv = vTextureCoord;
	uv.y = 1.0 - uv.y;

    gl_FragData[0] = vec4(vPosition, 1.0);
    gl_FragData[1] = texture2D(texture, uv);
}