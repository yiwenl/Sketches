// addvel.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureOrigin;

void main(void) {
	vec3 pos = texture2D(texturePos, vTextureCoord).rgb;
	vec3 vel = texture2D(textureVel, vTextureCoord).rgb;
	vec3 orgPos = texture2D(textureOrigin, vTextureCoord).rgb;

	pos += vel;

	const float maxY = 10.0;
	if(pos.y > maxY) {
		pos = orgPos;
	}

    gl_FragColor = vec4(pos, 1.0);
}