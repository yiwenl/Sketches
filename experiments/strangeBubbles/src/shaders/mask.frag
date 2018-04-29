// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform vec3 uLookDir;

void main(void) {
	float d = dot(vNormal, uLookDir);
	d = smoothstep(0.75, 1.0, d);
    gl_FragColor = vec4(vec3(d), 1.0);
}