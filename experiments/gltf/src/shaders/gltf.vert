#define SHADER_NAME gltf_pbr_vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;


void main(void) {
	vec4 position = uModelMatrix * vec4(aVertexPosition, 1.0);
	vPosition     = position.xyz / position.w;
	
	vNormal       = normalize(vec3(uModelMatrix * vec4(aNormal, 0.0)));
	// vNormal       = uNormalMatrix * aNormal;
	vTextureCoord = vec2(aTextureCoord.x, 1.0 - aTextureCoord.y);
	
	gl_Position   = uProjectionMatrix * uViewMatrix * position;
}
