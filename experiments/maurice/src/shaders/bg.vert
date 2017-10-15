// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform vec3 uPosition;
uniform vec3 uScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord;

void main(void) {
	vec4 position = vec4(aVertexPosition * uScale + uPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * position;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    vShadowCoord = uShadowMatrix * position;
}