precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D texture;

float map(float value, float sx, float sy, float tx, float ty) {
	float p = (value - sx) / ( sy - sx);
	return tx + p * ( ty - tx);
}


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

const float RX = 1.6;
const float RY = 1.2;
const mat2 rotation = mat2(RX,RY,-RY,RX);
const int NUM_ITER = 10;
const float PI = 3.141592657;
uniform float time;

void main(void) {   
	float offset = 5.000;
	vec2 uv = vTextureCoord + time;
	float grey = 0.0;

	float scale = 0.5;
	for(int i=0; i<NUM_ITER; i++) {
		grey += noise(uv*offset) * scale;
		offset *= 1.5;
		scale *= 0.2;
		uv *= rotation;
	}

	grey = (grey + 1.0) * 0.5;
	float center = 0.5 + noise(vTextureCoord * 5.01 + time) * 0.1;

	float offsetX = 0.0;
	if(vTextureCoord.x < center) offsetX = map(vTextureCoord.x, 0.0, center, 0.0, 0.5);
	else offsetX = map(vTextureCoord.x, center, 1.0, 0.5, 0.0);
	const float POWER = 3.05;
	const float THETA = 0.4;
	offsetX = tan(offsetX * PI * THETA);
	offsetX = pow(offsetX, POWER);
	
	grey = mix(offsetX, grey, 0.25);
	float r = sin(vTextureCoord.y*PI) * sin(vTextureCoord.x*PI);
	grey *= pow(r, 1.0);

	gl_FragColor = vec4(vec3(grey), 1.0);

}