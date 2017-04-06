// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aExtra;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float time;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vExtra;
varying float vAlpha;

const float PI = 3.141592653;

void main(void) {
	vec3 dir = normalize(aVertexPosition);
	float d = time * (1.0+aExtra.b);
	const float range = 1.0;
	d = mod(d, range);

	// vAlpha = smoothstep(range, 0.0, d);
	vAlpha = sin(PI * d/range);

	vec3 position = aVertexPosition + dir * d;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vNormal = aNormal;

    gl_PointSize = aExtra.r * 40.0 + 50.0;
    vExtra = aExtra;
}