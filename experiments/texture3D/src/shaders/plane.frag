// copy.frag

#define NUM 16

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D textures[NUM];
uniform float uNumSlices;
uniform float uAlpha;


vec3 getColor(float index) {
	vec3 color;
	if(index < 1.0) {
		color = texture2D(textures[0], vTextureCoord).rgb;
	} else if(index < 2.0) {
		color = texture2D(textures[1], vTextureCoord).rgb;
	} else if(index < 3.0) {
		color = texture2D(textures[2], vTextureCoord).rgb;
	} else if(index < 4.0) {
		color = texture2D(textures[3], vTextureCoord).rgb;
	} else if(index < 5.0) {
		color = texture2D(textures[4], vTextureCoord).rgb;
	} else if(index < 6.0) {
		color = texture2D(textures[5], vTextureCoord).rgb;
	} else if(index < 7.0) {
		color = texture2D(textures[6], vTextureCoord).rgb;
	} else if(index < 8.0) {
		color = texture2D(textures[7], vTextureCoord).rgb;
	} else if(index < 9.0) {
		color = texture2D(textures[8], vTextureCoord).rgb;
	} else if(index < 10.0) {
		color = texture2D(textures[9], vTextureCoord).rgb;
	} else if(index < 11.0) {
		color = texture2D(textures[10], vTextureCoord).rgb;
	} else if(index < 12.0) {
		color = texture2D(textures[11], vTextureCoord).rgb;
	} else if(index < 13.0) {
		color = texture2D(textures[12], vTextureCoord).rgb;
	} else if(index < 14.0) {
		color = texture2D(textures[13], vTextureCoord).rgb;
	} else if(index < 15.0) {
		color = texture2D(textures[14], vTextureCoord).rgb;
	} else {
		color = texture2D(textures[15], vTextureCoord).rgb;
	} 

	return color;
}

vec3 texture3D(vec3 pos) {
	vec3 color = vec3(0.0);
	float tz = (pos.z + 0.5) * float(NUM); //	-0.5, 0.5 -> 0, 1 -> 0, 16

	float i0 = floor(tz);
	float i1 = ceil(tz);

	vec3 c0 = getColor(i0);
	vec3 c1 = getColor(i1);

	float p = mod(tz, 1.0);

	color = mix(c0, c1, p);

	return color;
}

void main(void) {
	vec3 color = texture3D(vPosition);
    gl_FragColor = vec4(vec3(1.0), color.r * uAlpha / uNumSlices);
}