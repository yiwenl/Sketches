// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
uniform sampler2D texture;
uniform float num;
varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec3 vExtra;
varying vec3 vUVIndex;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


void main(void) {

 	vec2 uv = rotate(vTextureCoord-.5, vExtra.y) + .5;
 	// const float s = 0.98;
 	// uv.x = (uv.x - .5) * s + .5;
 	// uv.y = (uv.y - .5) * s + .5;
 	uv /= num;

 	float index = vUVIndex.x + vExtra.x;
 	float ou = mod(index, num)/num;
 	float ov = floor(index/num)/num;
 	uv += vec2(ou, ov);


 	gl_FragColor = texture2D(texture, uv);
}