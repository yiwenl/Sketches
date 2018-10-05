// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texture;
uniform sampler2D textureExtra;
uniform float uFishScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vDebug;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

#define PI 3.141592653

void main(void) {
	vec2 uvExtra  = aUV * vec2(2.0, 1.0);
	vec3 extra 	  = texture2D(textureExtra, uvExtra).xyz;

	vec3 posOffset = texture2D(texture, aUV).xyz;
	vec3 pos      = aVertexPosition * uFishScale * mix(extra.x, 1.0, .8);
	
	vec3 vel      = texture2D(texture, aUV + vec2(0.5, 0.0)).xyz;
	vDebug        = vel;

	float angle 	 = atan(vel.x, vel.z);
	pos.xz = rotate(pos.xz, angle + PI * 0.5);


	pos += posOffset;

	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
}