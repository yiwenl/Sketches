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
uniform float uTime;

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
	vec3 vel      = texture2D(texture, aUV + vec2(0.5, 0.0)).xyz;

	float g = 0.0;
	float s = 0.8;
	g = mod(aVertexPosition.x + s + 0.1, s * 2.0);

	vec3 pos = aVertexPosition;

	float t = length(vel.xz);
	float thetaY = atan(vel.y, t);
	float minAngle = 0.4;
	thetaY *= minAngle;

	// s = sign(thetaY);
	
	// thetaY = s * min(abs(thetaY), minAngle);
	pos.xy = rotate(pos.xy, thetaY);

	float theta = 2.5 * g + uTime * (5.0) + extra.r * 12.0;
	pos.xz = rotate(pos.xz, sin(theta) * pow(g, 1.0) * 0.2);


	vec3 posOffset = texture2D(texture, aUV).xyz;
	pos      = pos * uFishScale * mix(extra.x, 1.0, .8);
	
	

	float angle 	 = atan(vel.x, vel.z);
	pos.xz = rotate(pos.xz, angle + PI * 0.5);


	pos += posOffset;
	// pos.xz += aUV * vec2(2.0, 1.0) * 10.0 - 5.0;

	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;

	vDebug = vec3(g);
}