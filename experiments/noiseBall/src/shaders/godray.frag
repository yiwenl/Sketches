// godray.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uDecrease;
uniform float uScale;

float contrast(float value, float scale) {
	return (value - 0.5) * scale + 0.5;
}

vec2 contrast(vec2 value, float scale) {
	return vec2(contrast(value.x, scale), contrast(value.y, scale));
}


const int NUM_SAMPLES = 50;

void main(void) {
    vec4 color = vec4(0.0);
    vec2 uv = vTextureCoord;
    float strength = 0.075;
    for(int i=0; i<NUM_SAMPLES; i++) {
    	vec4 c = texture2D(texture, uv);
    	if(c.a <= 0.01) {
    		uv = contrast(uv, uScale);
    		strength *= uDecrease;
    		continue;
    	}
    	color += c * strength;

    	uv = contrast(uv, uScale);
    	strength *= uDecrease;
    }

    gl_FragColor = color;
}