// head.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform sampler2D uAoMap;
uniform vec3 lightPosition;
uniform float uExportNormal;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	float _diffuse = diffuse(vNormal, lightPosition);
    gl_FragColor = texture2D(uAoMap, vTextureCoord) + _diffuse * .5;

    if(uExportNormal>0.0) {
    	gl_FragColor = vec4(vNormal * .5 + .5, 1.0);
    }
}