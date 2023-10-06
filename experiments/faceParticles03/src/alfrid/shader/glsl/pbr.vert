#version 300 es

#define SHADER_NAME pbr_vert

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vPosition;


void main(void) {
	vec4 position = uModelMatrix * vec4(aVertexPosition, 1.0);
	vPosition     = position.xyz / position.w;
	
	vNormal       = normalize(vec3(uModelMatrix * vec4(aNormal, 0.0)));
	vTextureCoord = aTextureCoord;
	
	gl_Position   = uProjectionMatrix * uViewMatrix * position;
}
