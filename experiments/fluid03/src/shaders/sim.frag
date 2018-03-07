// copy.frag

#extension GL_EXT_draw_buffers : require 

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureExtra;
uniform float uSize;

const float padding = 0.1;

void main(void) {
	vec3 position = texture2D(texturePos, vTextureCoord).xyz; 
	vec3 extra = texture2D(textureExtra, vTextureCoord).xyz; 

	float speed = mix(extra.r, 1.0, .75);

	vec2 uv = position.xz / uSize; //	-1, 1
	uv = uv * .5 + .5;
	vec3 vel = texture2D(textureVel, uv).xzy;

	position += vel * 0.001 * speed;

	float bounds = uSize - padding;

	if(position.x < -bounds) {
		position.x = -bounds;
	} else if( position.x > bounds) {
		position.x = bounds;
	}

	if(position.z < -bounds) {
		position.z = -bounds;
	} else if( position.z > bounds) {
		position.z = bounds;
	}

    gl_FragData[0] = vec4(position, 1.0);
	gl_FragData[1] = vec4(extra, 1.0);
}