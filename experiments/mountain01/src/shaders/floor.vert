// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform sampler2D texture;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

void main(void) {
	vec3 pos = aVertexPosition;

	float y = texture2D(texture, aTextureCoord).r;
	pos.y = y * 3.0;
	vNoise = y;

	vec4 mvPosition = uViewMatrix * uModelMatrix * vec4(pos, 1.0);;
	gl_Position     = uProjectionMatrix * mvPosition;
	vViewPosition   = -mvPosition.xyz;
	vTextureCoord   = aTextureCoord;
	vNormal         = uNormalMatrix * aNormal;
}