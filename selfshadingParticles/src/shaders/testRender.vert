// testRender.vert

precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aFlipPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform float flipValue;
varying vec4 vColor;


void main(void) {

	vec3 pos = aVertexPosition + (aFlipPosition - aVertexPosition) * flipValue;
	pos = uModelViewMatrixInverse * pos;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vColor = vec4(1.0, 0.0, 0.0, 1.0);
}