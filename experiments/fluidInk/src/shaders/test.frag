// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float uRatio;
uniform float uOffset;



float getDistance( vec2 uv ) {
	vec2 center = vec2(uOffset, .5);
	vec2 dir = uv - center;
	dir.y /= uRatio;
	float d = length(dir);
	d = smoothstep(.11, .1, d);

	return d;
}

void main(void) {

	float d1 = getDistance( vTextureCoord );
	float d2 = getDistance( vTextureCoord - vec2(1.0, 0.0) );
	float d3 = getDistance( vTextureCoord + vec2(1.0, 0.0) );

    gl_FragColor = vec4(
    	d1 * vec3(1.0, 1.0, 1.0) + 
    	d2 * vec3(1.0, 1.0, 1.0) +
    	d3 * vec3(1.0, 1.0, 1.0),
    	1.0
	);
}