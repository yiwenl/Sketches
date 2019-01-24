// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureParticle;
uniform mat4 uNormalMatrix;
varying vec3 vColor;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

#define LIGHT vec3(0.0, 0.2, -1.0)

void main(void) {
	if(distance(gl_PointCoord.xy, vec2(.5)) > .5) discard;	
	vec4 colorNormal = texture2D(textureParticle, gl_PointCoord);
	if(colorNormal.a <= 0.1) discard;
	vec3 N           = colorNormal.xyz * 2.0 - 1.0;
	float d          = diffuse(N, LIGHT);
	d                = mix(d, 1.0, .25);
	gl_FragColor     = vec4(vColor * d, 1.0);
    // gl_FragColor = vec4(1.0);
}