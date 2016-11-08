// water.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uSeaLevel;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vClipSpace;

void main(void) {
	vec3 position = aVertexPosition + vec3(0.0, uSeaLevel, 0.0);

	vClipSpace = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}