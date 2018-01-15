// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vWsPosition;

void main(void) {
	vWsPosition = vec4(aVertexPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vWsPosition;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}