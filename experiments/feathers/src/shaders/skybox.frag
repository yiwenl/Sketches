// basic.frag

#define SHADER_NAME BASIC_FRAGMENT

precision highp float;

uniform samplerCube texture;
uniform float		uExposure;
uniform float		uGamma;

varying vec2 vTextureCoord;
varying vec3 vVertex;

// Filmic tonemapping from
// http://filmicgames.com/archives/75

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;

vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

void main(void) {
	vec3 color   		= textureCube(texture, vVertex).rgb;

	color				= Uncharted2Tonemap( color * uExposure );
	// white balance
	color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );
	
	// gamma correction
	color				= pow( color, vec3( 1.0 / uGamma ) );

	gl_FragColor = vec4(color, 1.0);
}