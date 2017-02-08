// cube.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;
uniform float uNum;


vec2 getUVOffset(float index) {
	float x = mod(index, uNum);		//	index = 32, x = mod(32, 8) = 0
	float y = floor(index/uNum);	//	index = 32, y = floor(32/8) = 4
	return vec2(x, y) / uNum;		//	uvOffset = (x, y) / 8 = (0, 4) / 8
}

vec3 texture3D(vec3 v) {
	vec2 uv = v.xy / uNum;
	float totalSlices = uNum * uNum - 1.0;	//	1 ~ 64
	float currentSlice = v.z * totalSlices;		//	v.z = 0.5, currentSlice = 32

	float startSlice, endSlice;

	startSlice = min(floor(currentSlice), totalSlices);
	if(v.z == 1.0) {
		endSlice = startSlice;
	} else {
		endSlice = startSlice + 1.0;
	}

	vec2 uv0 = uv + getUVOffset(startSlice);
	vec2 uv1 = uv + getUVOffset(endSlice);

	float p = (currentSlice - startSlice) / (endSlice - startSlice);

	vec4 color0 = texture2D(texture, uv0);
	vec4 color1 = texture2D(texture, uv1);
	vec4 color = mix(color0, color1, p);

	return color.rgb;
}


void main(void) {
	vec3 color = texture3D(vPosition + 0.5);
	// vec3 color = texture3D(vPosition * .5 + .5);
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vPosition + 0.5, 1.0);
}