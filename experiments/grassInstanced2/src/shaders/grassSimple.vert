// grassSimple.vert

precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aColor;
attribute vec2 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uHit;
uniform float uPushStrength;
uniform float uRange;
uniform sampler2D textureNoise;

varying vec2 vTextureCoord;
varying vec2 vUVNoise;
varying vec3 vNormal;
varying vec3 vColor;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


const float PI = 3.141592653;

void main(void) {
    vec3 position = aVertexPosition;
	position.xz   = rotate(position.xz, aExtra.x);
	position.xz   += aPosOffset.xz;
	position.y    *= aPosOffset.y;

	float dist = distance(position, uHit);
	const float maxRadius = 3.0;
	if(dist < maxRadius) {
		vec3 dir = normalize(uHit - position);
		float f = (1.0 - dist / maxRadius);
		f = sin(f * PI * 0.5);
		f *=  aTextureCoord.y * uPushStrength;
		position.xz -= dir.xz * f;
	}

	vec2 uvNoise  = aPosOffset.xz / uRange * 0.5 + 0.5;
	vec3 noise    = texture2D(textureNoise, uvNoise).xyz;
	position.y    += noise.x * 0.25;
	position.xz   += (noise.yz - 0.5) * uPushStrength * 1.5 * aTextureCoord.y;
	vUVNoise      = uvNoise;
	
	vec3 normal   = aNormal;
	normal.xz     = rotate(normal.xz, aExtra.x);
	
	vNormal       = normal;
	
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vec2 uv       = aTextureCoord;
	uv.x          = uv.x * .5 + aExtra.y;
	vTextureCoord = uv;
	vColor        = aColor;
}