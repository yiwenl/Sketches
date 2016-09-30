//grass.frag


#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
varying float vHeight;
varying vec3 vGrassNormal;
uniform sampler2D texture;
uniform float uTerrainSize;

#define RANGE 2.0

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {

	float opacity 	= 1.0;
	float absz 		= abs(vPosition.z);
	opacity 		= smoothstep(uTerrainSize, uTerrainSize - RANGE, absz);
	
	vec4 color 		= texture2D(texture, vTextureCoord);
	color.a 		*= opacity;
	
	if(color.a < 0.75) discard;


	float d 		= diffuse(vGrassNormal, vec3(1.0));
	d 				= mix(d, 1.0, .6);
	color.rgb 		*= d;
    gl_FragColor 	= color;
    // gl_FragColor.rgb *= vHeight;
}