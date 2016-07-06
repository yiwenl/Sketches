// grass.frag
#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUV;

void main(void) {
	// float d           = abs(vTextureCoord.x - .5) * 2.0;
	// const float range = 0.01;
	// float v           = 1.0 - vTextureCoord.y;
	// float a           = 1.0 - smoothstep(v-range, v+range, d);
	// if(a              <= 0.01) discard;

	float a = 1.0;
	float g = mix(vTextureCoord.y, 1.0, .25);
    gl_FragColor = vec4(vec3(vUV.r), a);
    gl_FragColor = vec4(vec3(g), a);
}