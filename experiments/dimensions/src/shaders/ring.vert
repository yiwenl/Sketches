// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uLocalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uPosition;

uniform float zOffset;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {

	vec4 wsPosition = uLocalMatrix * vec4(aVertexPosition, 1.0);
	float r = length(uPosition);
	vec3 dir = normalize(uPosition);
	wsPosition.xyz += dir * (r - zOffset * 0.1);
	wsPosition = uModelMatrix * wsPosition;

    gl_Position = uProjectionMatrix * uViewMatrix * wsPosition;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}