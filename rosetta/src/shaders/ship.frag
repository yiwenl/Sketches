// ship.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureAO;
varying vec3 vNormal;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

const float fade = .95;
const vec3 COLOR0 = vec3(1.0, 1.0, fade);
const vec3 COLOR1 = vec3(fade, fade, 1.0);
const vec3 LIGHT0 = vec3(1.0, .5, 1.0);
const vec3 LIGHT1 = vec3(-1.0, -.2, 1.0);
const float ambient = .5;


const vec3 GRD_COLOR_0 = vec3(24.0, 29.0, 50.0)/255.0;
const vec3 GRD_COLOR_1 = vec3(240.0, 234.0, 223.0)/255.0;

void main(void) {
	vec3 _diffuse0 = diffuse(vNormal, LIGHT0, COLOR0) * .5;
	vec3 _diffuse1 = diffuse(vNormal, LIGHT1, COLOR1) * .5;
	vec3 color = ambient + _diffuse0 + _diffuse1;
	float ao = texture2D(textureAO, vTextureCoord).r;
	// ao = smoothstep(0.0, 0.85, ao);
	color *= ao;


	float l = length(color.rgb) / length(vec3(1.0));
	color = mix(GRD_COLOR_0, GRD_COLOR_1, l);

    gl_FragColor = vec4(color, 1.0);
}