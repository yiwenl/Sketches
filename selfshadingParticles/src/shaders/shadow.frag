// shadow.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec4 vPosition;
varying vec4 vShadowCoord;
varying vec4 vColor;

uniform vec3 color;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform vec3 lightPosition;
uniform sampler2D textureDepth;

const float shadowMapSize = 1024.0;
/*
const vec2 poissonDisk[4] = vec2[](
	vec2( -0.94201624, -0.39906216 ),
	vec2( 0.94558609, -0.76890725 ),
	vec2( -0.094184101, -0.92938870 ),
	vec2( 0.34495938, 0.29387760 )
);
*/
void main(void) {
	if(vColor.a <= 0.0) discard;

	vec4 ShadowCoord	= vShadowCoord / vShadowCoord.w;

	float bias = .0001;
	float visibility = 1.0;
	float descrease = .1;

	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( -0.94201624, -0.39906216 )/700.0 ).z  <  ShadowCoord.z-bias ){		visibility-=descrease;}
	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( 0.94558609, -0.768907256 )/700.0 ).z  <  ShadowCoord.z-bias ){		visibility-=descrease;}
	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( -0.094184101, -0.92938870 )/700.0 ).z  <  ShadowCoord.z-bias ){	visibility-=descrease;}
	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( 0.34495938, 0.29387760 )/700.0 ).z  <  ShadowCoord.z-bias ){		visibility-=descrease;}

	
	// visibility = mix(visibility, 1.0, .25);		

	vec4 color = vColor;
	color.rgb *= visibility;
	gl_FragColor = color;
}