// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aPosOffset;
attribute vec3 aNormal;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float num;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vExtra;

void main(void) {
	vec3 position = aVertexPosition + aPosOffset;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);

    vTextureCoord = aTextureCoord/num + aExtra.xy;
    vNormal = aNormal;


    vExtra = aExtra;
}