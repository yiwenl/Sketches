// basic.frag

#define SHADER_NAME BASIC_FRAGMENT

precision highp float;
uniform sampler2D texture;
varying vec2 vTextureCoord;
varying vec3 vNormal;


const vec3 light = vec3(1.0, 1.0, 1.0);

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}

void main(void) {
	vec4 color = texture2D(texture, vTextureCoord);
    float _diffuse = mix(diffuse(vNormal, light), 1.0, .2);
    gl_FragColor = color * _diffuse;;
}