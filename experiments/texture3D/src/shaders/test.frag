#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uOffset;
uniform float uNum;


vec2 getUVOffset(float index) {
	float x = mod(index, uNum);
	float y = floor(index/uNum);
	return vec2(x, y) / uNum;
}

vec4 texture3D(float index) {
	vec2 uv = vTextureCoord / uNum;
	float tmp = index * uNum * uNum;
	float index0 = floor(tmp);
	float index1 = ceil(tmp);

	vec2 uv0 = uv + getUVOffset(index0);
	vec2 uv1 = uv + getUVOffset(index1);

	float p = (tmp - index0) / (index1 - index0);

	vec4 color0 = texture2D(texture, uv0);
	vec4 color1 = texture2D(texture, uv1);
	vec4 color = mix(color0, color1, p);
	return color;
}

void main(void) {

	vec4 color = texture3D(uOffset);


    gl_FragColor = color;
}