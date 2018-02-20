// copy.frag

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vWsPosition;

uniform sampler2D texture;
uniform vec3 uHit;
uniform float uHoleRadius;
uniform float uExposure;
uniform float uGamma;


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
	float d = distance(vWsPosition, uHit);
	if(d < uHoleRadius) {
		discard;
	}



	vec3 color = texture2D(texture, vTextureCoord).rgb;


	// apply the tone-mapping
	color = Uncharted2Tonemap( color * uExposure );
	// white balance
	color = color * ( 1.0 / Uncharted2Tonemap( vec3( 20.0 ) ) );
	
	// gamma correction
	color = pow( color, vec3( 1.0 / uGamma ) );

    gl_FragColor = vec4(color, 1.0);
}