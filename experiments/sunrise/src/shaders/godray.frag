#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float time;
uniform float density;
uniform float weight;
uniform float decay;


const vec2 lightPosition = vec2(.5);
const float NUM_SAMPLES = 25.0;

float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));	
    return fract(sin(h)*43758.5453123);
}


float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );	
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

vec4 godray() {

	float x = 1.0;
	float y = 1.0;

	vec2 deltaTextCoord = vec2(vTextureCoord - vec2(x, y));
	vec2 textCoord = vTextureCoord;
	deltaTextCoord *= 1.0/ NUM_SAMPLES * density;
	float illuminationDecay = 1.0;
	vec2 textCoordNoise;
	vec4 color = vec4(0.0);

	
	for(float i=0.0; i<NUM_SAMPLES; i++) {
		textCoord -= deltaTextCoord;
		vec4 texel = texture2D(texture, textCoord);
		texel *= illuminationDecay * weight;
		color += texel;

		illuminationDecay *= decay;
	}


	return color;
}


void main(void) {
    gl_FragColor = godray();
}