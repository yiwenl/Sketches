// test.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uOffset;

const float size = 4.0;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {

	vec3 position = aVertexPosition;
	position.z += uOffset * size - size*0.5;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}