// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uSize;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vWsPosition;

void main(void) {

	vec3 position = aVertexPosition * uSize;
	vec4 wsPosition = uModelMatrix * vec4(position, 1.0);

	vWsPosition = wsPosition.xyz;

    gl_Position = uProjectionMatrix * uViewMatrix * wsPosition;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}