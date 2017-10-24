// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uTime;
uniform float uScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vLife;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

const float PI = 3.141592653;

void main(void) {

	vec3 position = aVertexPosition;

	vec2 dir = normalize(position.xy);
	dir = rotate(dir, PI * 0.5);

	vec3 dir3D = normalize(vec3(dir, (aTextureCoord.y - .5) * .1));

	float d = mod(aTextureCoord.x + uTime * mix(aTextureCoord.y, 1.0, .5), 1.0);
	position += dir3D * d * mix(aTextureCoord.x * aTextureCoord.y, 1.0, .5);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;


    float s = sin(d * PI) * uScale;

    gl_PointSize = (5.0 * mix(aTextureCoord.y, 1.0, .25) + 5.0) * s;

    vLife = 1.0 - d;
}