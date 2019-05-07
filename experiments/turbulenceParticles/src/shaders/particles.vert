// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texturePos;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vExtra;

void main(void) {

	vec3 pos = texture2D(texturePos, aTextureCoord).xyz;
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	vTextureCoord = aTextureCoord;
	vNormal = aNormal;
	
	vColor = vec3(1.0);
	vExtra = aVertexPosition;
}