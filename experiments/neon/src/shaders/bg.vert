// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uRatio;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	vec3 position = aVertexPosition * 1.25;
	// position.x /= uRatio;
	position.y *= uRatio;
    gl_Position = vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}