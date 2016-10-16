// butterflies.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
uniform sampler2D texture;
uniform vec3 uLightPosition;
varying float vDepth;
varying vec4 viewSpace;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

#define density 0.05

#define fogColor vec4(1.0, 1.0, 1.0, 0.0)

void main(void) {
	vec4 color = texture2D(texture, vTextureCoord);
	if(color.a < .3) discard;

	float _diffuse 	= diffuse(vNormal, uLightPosition);
	_diffuse 		= mix(_diffuse, 1.0, .5);
	color.rgb 		*= _diffuse * vColor;

	// float dist 		= length(viewSpace);
	// // float dist 		= (gl_FragCoord.z / gl_FragCoord.w);
	// float fogFactor = 1.0 / exp(density * density * dist * dist);
	// fogFactor 		= clamp(density, 0.0, 1.0);
	// color 			= mix(fogColor, color, fogFactor);
	// color.rgb 		= vec3(dist);

 	gl_FragColor 	= color;
}