// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform sampler2D textureHatching;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const vec3 LIGHT = vec3(1.0);
const float num = 6.0;

void main(void) {
	float diff = diffuse(vNormal, LIGHT);
	diff = pow(diff+0.1, 2.2);
	diff = floor(diff * num) / num;
	vec2 uv = fract(vTextureCoord * 30.0) / num;
	uv.x += 1.0 - diff;


    // gl_FragColor = texture2D(textureHatching, uv);
    // diff = mix(diff, 1.0, .25);
    gl_FragColor = vec4(vec3(diff), 1.0);
    // gl_FragColor.rgb *= diff;
}