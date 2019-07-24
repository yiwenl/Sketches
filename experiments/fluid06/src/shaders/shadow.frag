// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying float vHeight;
uniform sampler2D textureParticle;
uniform vec3 uColors[5];
uniform vec3 uLightPos;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


vec3 getColor(float index) {
	if(index < 0.5) {
		return uColors[0];
	} else if(index < 1.5) {
		return uColors[1];
	} else if(index < 2.5) {
		return uColors[2];
	} else if(index < 3.5) {
		return uColors[3];
	} else {
		return uColors[4];
	}
}

#define L vec3(1.0, 0.1, 4.0)

void main(void) {
	vec4 N = texture2D(textureParticle, gl_PointCoord);
	if(N.a <= 0.01) {
		discard;
	}
    gl_FragColor = vec4(1.0);
}