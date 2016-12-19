// terrain.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uMaxHeight;
uniform sampler2D textureHeight;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	float height  = texture2D(textureHeight, aTextureCoord).r * uMaxHeight;
	vec3 position = aVertexPosition + vec3(0.0, height+.5, 0.0);
	
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
}