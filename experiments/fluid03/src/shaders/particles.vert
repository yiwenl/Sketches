// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aUVOffset;
attribute vec3 aNormal;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureColor;
uniform float uSize;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;


const float PI = 3.141592653;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 posOffset = texture2D(texturePos, aUVOffset).xyz;
	vec3 posPrev = texture2D(textureVel, aUVOffset).xyz;

	vec2 uv = posOffset.xz / uSize;
	uv = uv * .5 + .5;
	

	vec3 vel = (posOffset - posPrev).xzy;
	float speed = length(vel) * 5.0;

	float angle = atan(vel.x, vel.y);

	vColor = texture2D(textureColor, uv).xyz * ( 1.0 + speed * 0.2) * mix(aExtra.z, 1.0, .9);

	vec3 size = mix(aExtra, vec3(1.0), .8);
	vec3 position = aVertexPosition * ( 1.0 + speed) * size;

	float noise = mix(aExtra.y, 1.0, .5);
	position.z *= ( 1.0 + speed * 0.5) * noise;
	position.y *= ( 1.0 + speed * 4.0) * noise;
	position.xz = rotate(position.xz, angle);

	position += posOffset;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;

    vec3 N = aNormal;
    N.xz = rotate(N.xz, angle);
    vNormal = N;
}