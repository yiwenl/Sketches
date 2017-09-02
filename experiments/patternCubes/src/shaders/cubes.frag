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
	// float d = diffuse(vNormal, LIGHT);
	// d = mix(d, 1.0, .5);
 //    gl_FragColor = vec4(vec3(d), 1.0);

 	vec2 uv = rotate(vTextureCoord-.5, vExtra.y) + .5;
 	uv /= num;

 	// uv += vec2(0.25, 0.25);

 	// uv.x += 0.25;
 	// vec2 uv = vTextureCoord;
 	float index = vUVIndex.x + vExtra.x;
 	float ou = mod(index, num)/num;
 	float ov = floor(index/num)/num;
 	uv += vec2(ou, ov);

 	// uv = rotate(uv-.5, vExtra.y) + .5;


 	gl_FragColor = texture2D(texture, uv);
}