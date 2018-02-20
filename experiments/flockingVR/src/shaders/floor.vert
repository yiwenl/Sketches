// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord;

void main(void) {
	vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vShadowCoord = uShadowMatrix * worldPosition;
}