// terrain.vert


precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureHeight;
uniform float uMaxHeight;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vHeight;
varying vec3 vPosition;

void main(void) {
	vHeight       = texture2D(textureHeight, aTextureCoord).r;
	float height  = vHeight * uMaxHeight;
	vec3 position = aVertexPosition + vec3(0.0, height, 0.0);
	
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	vPosition     = position;
}