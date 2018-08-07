// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPoint0;
attribute vec3 aPoint1;
attribute vec3 aExtra;

uniform vec3 uControl0;
uniform vec3 uControl1;
uniform vec3 uColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vColor;

vec3 cubic_bezier(vec3 A, vec3 B, vec3 C, vec3 D, float t)
{
	vec3 E = mix(A, B, t);
	vec3 F = mix(B, C, t);
	vec3 G = mix(C, D, t);

	vec3 H = mix(E, F, t);
	vec3 I = mix(F, G, t);

	vec3 P = mix(H, I, t);

	return P;
}

#define RANGE 5.0
#define PI 3.141592653

void main(void) {
	float tx      = aVertexPosition.x;
	float t       = aExtra.x + tx + uTime * mix(aExtra.z, 1.0, .25);
	t             = mod(t + RANGE, RANGE * 2.0);
	t             /= RANGE * 2.0;
	vec3 position = cubic_bezier(aPoint0, uControl0, uControl1, aPoint1, t);
	
	float scale   = abs(aVertexPosition.x) / 0.2;
	scale         = cos(scale * PI * 0.5);

	float a       = abs(position.x);
	a             = smoothstep(RANGE - 0.25, RANGE-0.75, a);

	position.yz   += aVertexPosition.yz * scale * aExtra.y * a;
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	
	
	vec4 color    = vec4(uColor, a);
	vColor        = color;
}