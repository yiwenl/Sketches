// basic.vert

#define SHADER_NAME SKYBOX_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vVertex;
varying vec3 vNormal;

void main(void) {
	mat4 matView = uViewMatrix;
	matView[3][0] = 0.0;
	matView[3][1] = 0.0;
	matView[3][2] = 0.0;
	
	gl_Position = uProjectionMatrix * matView * uModelMatrix * vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
	
	vVertex = aVertexPosition;
	vNormal = aNormal;
}