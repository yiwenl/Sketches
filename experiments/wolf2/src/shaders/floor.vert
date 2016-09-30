// debug.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform sampler2D texture;
uniform float uMaxHeight;

varying vec2 vTextureCoord;
varying vec3 vNormal;
void main(void) {
	vec3 position 			= aVertexPosition;
	float colorHeight 		= texture2D(texture, aTextureCoord).r;
	position.y 				+= colorHeight * uMaxHeight;

    gl_Position				= uProjectionMatrix * uViewMatrix * vec4(position, 1.0);

	vTextureCoord			= aTextureCoord;
	vNormal 				= aNormal;
}