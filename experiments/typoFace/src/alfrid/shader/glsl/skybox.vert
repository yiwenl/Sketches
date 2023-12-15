#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTextureCoord;
out vec3 vVertex;
out vec3 vNormal;

void main(void) {
	mat4 matView = uViewMatrix;
	matView[3][0] = 0.0;
	matView[3][1] = 0.0;
	matView[3][2] = 0.0;
	
	gl_Position = uProjectionMatrix * matView * uModelMatrix * vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
	
	vVertex = aVertexPosition;
	// vVertex = normalize(aVertexPosition);
	vNormal = aNormal;
}