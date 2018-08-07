// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uControl0;
uniform vec3 uControl1;

varying vec2 vTextureCoord;
varying vec3 vNormal;


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

void main(void) {
	vec3 position = cubic_bezier(aVertexPosition, uControl0, uControl1, aNormal, aTextureCoord.x);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}